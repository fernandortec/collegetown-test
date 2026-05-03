import type { Locator, Page } from "playwright";

import type { StaffRecord } from "../school.types";

export type RawStaffRecord = {
  name?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function normalizeStaffRecords(
  records: RawStaffRecord[],
): StaffRecord[] {
  return records.flatMap((record) => {
    const name = cleanText(record.name);
    const title = cleanTitle(record.title);
    if (!name || !title) return [];

    const email = firstEmail(record.email);
    const phone = firstPhone(record.phone);

    return {
      name,
      title,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    };
  });
}

export function dedupeStaffRecords(records: StaffRecord[]): StaffRecord[] {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = [
      record.name,
      record.title,
      record.email ?? "",
      phoneDedupKey(record.phone) ?? "",
    ]
      .join("|")
      .toLowerCase();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function cleanText(value?: string | null): string {
  return stripFieldLabel(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanTitle(value?: string | null): string {
  return stripFieldLabel(value ?? "")
    .replace(/\u00a0/g, " ")
    .split(/\r?\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(", ");
}

export function firstEmail(value?: string | null): string | undefined {
  const match = stripContactLabel(value ?? "")
    .replace(/^.*mailto:/i, "mailto:")
    .match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return match?.[0].toLowerCase();
}

export function firstPhone(value?: string | null): string | undefined {
  const cleaned = stripContactLabel(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return undefined;

  const match = cleaned.match(
    /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]\d{4}|\d{3}-\d{4}/,
  );
  return match?.[0].trim();
}

export async function extractGenericStaffRecords(
  page: Page,
): Promise<StaffRecord[]> {
  const records = [
    ...(await extractFromTableRows(page)),
    ...(await extractFromCards(page)),
    ...(await extractFromText(page)),
  ];

  return preferRicherRecordsByNameAndTitle(normalizeStaffRecords(records));
}

async function extractFromTableRows(page: Page): Promise<RawStaffRecord[]> {
  const records: RawStaffRecord[] = [];
  const rows = page.locator("tr");
  for (let rowIndex = 0; rowIndex < (await rows.count()); rowIndex += 1) {
    const record = await extractFromTableRow(rows.nth(rowIndex));
    if (record) records.push(record);
  }

  return records;
}

async function extractFromTableRow(row: Locator): Promise<RawStaffRecord | null> {
  const cells = row.locator("th, td");
  const cellCount = await cells.count();
  if (cellCount < 2) return null;

  const mapped: RawStaffRecord = {};
  const looseText: string[] = [];

  for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
    const cell = cells.nth(cellIndex);
    const label = (
      (await cell.getAttribute("data-title")) ??
      (await cell.getAttribute("headers")) ??
      (await cell.getAttribute("aria-label")) ??
      (await cell.getAttribute("class")) ??
      ""
    )
      .replace(/[_-]+/g, " ")
      .toLowerCase();
    const value = await cell.textContent();
    const emailAnchor = cell.locator('a[href*="mailto:"]').first();
    const phoneAnchor = cell.locator('a[href*="tel:"]').first();
    const emailLink = await optionalAttribute(emailAnchor, "href");
    const phoneLink =
      (await optionalText(phoneAnchor)) ||
      (await optionalAttribute(phoneAnchor, "href"));

    if (isNameLabel(label)) mapped.name ??= value;
    else if (isTitleLabel(label)) mapped.title ??= value;
    else if (isEmailLabel(label)) mapped.email ??= emailLink ?? value;
    else if (isPhoneLabel(label)) mapped.phone ??= phoneLink ?? value;
    else looseText.push(value ?? "");

    mapped.email ??= emailLink;
    mapped.phone ??= phoneLink;
  }

  if (normalizeStaffRecords([mapped]).length > 0) return mapped;

  const values = looseText.map(cleanText).filter(Boolean);
  if (values.length < 2) return null;

  return {
    name: values[0],
    title: values[1],
    email: values.find((value) => firstEmail(value)),
    phone: values.find((value) => firstPhone(value)),
  };
}

async function extractFromCards(page: Page): Promise<RawStaffRecord[]> {
  const records: RawStaffRecord[] = [];
  const selector = staffCardSelector();
  const cards = page.locator(selector);
  for (let cardIndex = 0; cardIndex < (await cards.count()); cardIndex += 1) {
    const record = await extractFromCard(cards.nth(cardIndex), selector);
    if (record) records.push(record);
  }

  return records;
}

async function extractFromCard(
  card: Locator,
  cardSelector: string,
): Promise<RawStaffRecord | null> {
  if ((await card.locator(cardSelector).count()) > 0) return null;

  const emailLink = card.locator('a[href*="mailto:"]').first();
  const phoneLink = card.locator('a[href*="tel:"]').first();
  const text = await card.textContent();
  const emailValue = await linkValue(emailLink, text);
  const phoneValue = await linkValue(phoneLink, text, { preferText: true });

  if (!firstEmail(emailValue) && !firstPhone(phoneValue)) return null;

  const name = await firstNonEmptyText(card, [
    '[class*="name"]',
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    'a:not([href*="mailto:"]):not([href*="tel:"])',
  ]);
  const title = await firstNonEmptyText(
    card,
    [
      '[class*="title"]',
      '[class*="position"]',
      '[class*="role"]',
      '[class*="job"]',
      "p",
      "div",
    ],
    name,
  );

  return { name, title, email: emailValue, phone: phoneValue };
}

async function extractFromText(page: Page): Promise<RawStaffRecord[]> {
  const bodyText =
    (await page.locator("body").textContent()) ||
    (await page.locator("html").textContent()) ||
    "";
  const lines = bodyText
    .split(/\r?\n+/)
    .map(cleanText)
    .filter(Boolean)
    .filter(
      (line) =>
        !/^(staff directory|search|filter|print|download|menu|home)$/i.test(
          line,
        ),
    );

  const records: RawStaffRecord[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const window = lines.slice(index, index + 6);
    const nameIndex = window.findIndex(isLikelyPersonName);
    if (nameIndex === -1) continue;

    const trailingLines = window.slice(nameIndex + 1);
    const emailLine = trailingLines.find((line) => firstEmail(line));
    const phoneLine = trailingLines.find((line) => firstPhone(line));
    if (!emailLine && !phoneLine) continue;

    const title = trailingLines.find(
      (line) => line !== emailLine && line !== phoneLine && isLikelyTitle(line),
    );

    if (!title) continue;

    records.push({
      name: window[nameIndex],
      title,
      email: emailLine,
      phone: phoneLine,
    });
    index += nameIndex + 1;
  }

  return records;
}

function staffCardSelector(): string {
  return [
    '[class*="staff"]',
    '[class*="person"]',
    '[class*="profile"]',
    '[class*="directory"]',
    '[class*="coach"]',
    '[class*="card"]',
    '[itemtype*="Person"]',
  ].join(",");
}

async function optionalText(locator: Locator): Promise<string | null> {
  if ((await locator.count()) === 0) return null;
  return locator.textContent();
}

async function optionalAttribute(
  locator: Locator,
  name: string,
): Promise<string | null> {
  if ((await locator.count()) === 0) return null;
  return locator.getAttribute(name);
}

async function linkValue(
  locator: Locator,
  fallback: string | null,
  options: { preferText?: boolean } = {},
): Promise<string | null> {
  const href = await optionalAttribute(locator, "href");
  const text = await optionalText(locator);

  return options.preferText
    ? text || href || fallback
    : href || text || fallback;
}

async function firstNonEmptyText(
  root: Locator,
  selectors: string[],
  except?: string | null,
): Promise<string | undefined> {
  const exceptText = cleanText(except);

  for (const selector of selectors) {
    const direct = cleanText(
      await optionalText(root.locator(`:scope > ${selector}`).first()),
    );
    if (direct && direct !== exceptText) return direct;

    const nested = cleanText(
      await optionalText(root.locator(selector).first()),
    );
    if (nested && nested !== exceptText) return nested;
  }

  return undefined;
}

function isNameLabel(label: string): boolean {
  return /(^|\b)(name|full.?name|person|staff)(\b|$)/i.test(label);
}

function isTitleLabel(label: string): boolean {
  return /(^|\b)(title|position|role|job)(\b|$)/i.test(label);
}

function isEmailLabel(label: string): boolean {
  return /(^|\b)(e.?mail|email)(\b|$)/i.test(label);
}

function isPhoneLabel(label: string): boolean {
  return /(^|\b)(phone|tel|office)(\b|$)/i.test(label);
}

function isLikelyPersonName(line: string): boolean {
  if (line.length > 60 || /@|\d|:/.test(line)) return false;
  const words = line.split(/\s+/);
  return (
    words.length >= 2 &&
    words.length <= 6 &&
    words.every((word) => isNameWord(word) || isNameParticle(word))
  );
}

function isLikelyTitle(line: string): boolean {
  if (line.length > 100 || /@/.test(line)) return false;
  return /director|coach|coordinator|assistant|associate|athletic|athletics|administrator|trainer|nutrition|counselor|psychologist|operations|communications|compliance|president|staff/i.test(
    line,
  );
}

function preferRicherRecordsByNameAndTitle(
  records: StaffRecord[],
): StaffRecord[] {
  const byIdentity = new Map<string, StaffRecord>();

  for (const record of records) {
    const key = `${record.name}|${record.title}`.toLowerCase();
    const existing = byIdentity.get(key);
    if (!existing) {
      byIdentity.set(key, record);
      continue;
    }

    byIdentity.set(key, {
      ...existing,
      ...record,
      email: existing.email ?? record.email,
      phone: existing.phone ?? record.phone,
    });
  }

  return [...byIdentity.values()];
}

export async function extractSidearmStaffRows(
  page: Page,
): Promise<RawStaffRecord[]> {
  return page.evaluate<RawStaffRecord[]>(() => {
    const rows: RawStaffRecord[] = [];

    for (const element of document.querySelectorAll(
      "tr.sidearm-staff-member",
    )) {
      const nameCell = element.querySelector('[headers*="col-fullname"], th');
      const titleCell = element.querySelector('[headers*="col-staff_title"]');
      const phoneCell = element.querySelector('[headers*="col-staff_phone"]');
      const emailCell = element.querySelector('[headers*="col-staff_email"]');
      const emailLink =
        emailCell?.querySelector<HTMLAnchorElement>('a[href*="mailto:"]');

      rows.push({
        name: nameCell?.textContent,
        title: titleCell?.textContent,
        phone: phoneCell?.textContent,
        email: emailLink?.href ?? emailCell?.textContent,
      });
    }

    if (rows.length > 0) return rows;

    for (const element of document.querySelectorAll<HTMLAnchorElement>(
      'a[href*="staff-directory"]',
    )) {
      const aria = element.getAttribute("aria-label") ?? "";
      const ariaParts = aria
        .split(":")
        .map((part) => part.trim())
        .filter(Boolean);
      let cursor = element.nextSibling;
      let email: string | null | undefined;
      let phone: string | null | undefined;
      let text = "";

      while (cursor) {
        if (
          cursor instanceof HTMLAnchorElement &&
          cursor.href.includes("staff-directory")
        )
          break;

        text += ` ${cursor.textContent ?? ""}`;

        if (
          !email &&
          cursor instanceof HTMLAnchorElement &&
          cursor.href.includes("mailto:")
        ) {
          email = cursor.href || cursor.textContent;
        }

        if (
          !phone &&
          cursor instanceof HTMLAnchorElement &&
          cursor.href.includes("tel:")
        ) {
          phone = cursor.textContent || cursor.href;
        }

        cursor = cursor.nextSibling;
      }

      rows.push({
        name: element.textContent,
        title: ariaParts.length >= 3 ? ariaParts[1] : undefined,
        phone: phone ?? text,
        email,
      });
    }

    return rows;
  });
}

function stripFieldLabel(value: string): string {
  return value
    .replace(
      /^(?:name|full.?name|title|phone|e-?mail|email)\s*(?:[:|\-]\s*|\u2013\s*|\u2014\s*)/i,
      "",
    )
    .replace(/^(?:name|full.?name|title|phone|e-?mail|email)$/i, "");
}

function stripContactLabel(value: string): string {
  return value
    .replace(
      /^(?:phone|tel|office|e-?mail|email)\s*(?:[:|\-]\s*|\u2013\s*|\u2014\s*)/i,
      "",
    )
    .replace(/^(?:phone|tel|office|e-?mail|email)$/i, "");
}

function phoneDedupKey(value?: string): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

function isNameParticle(word: string): boolean {
  return /^(?:da|de|del|della|der|di|dos|du|la|le|van|von|bin|al)$/i.test(
    word.replace(/,$/, ""),
  );
}

function isNameWord(word: string): boolean {
  return /^[\p{Lu}][\p{L}'’. -]*,?$/u.test(word) && /[\p{L}]/u.test(word);
}
