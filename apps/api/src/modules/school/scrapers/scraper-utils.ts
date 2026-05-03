import * as cheerio from "cheerio";

import type { StaffRecord } from "../school.types";

export type RawStaffRecord = {
  name?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function normalizeStaffRecords(records: RawStaffRecord[]): StaffRecord[] {
  const seen = new Set<string>();
  const normalized: StaffRecord[] = [];

  for (const record of records) {
    const name = cleanText(record.name);
    const title = cleanTitle(record.title);
    if (!name || !title) continue;

    const email = firstEmail(record.email);
    const phone = firstPhone(record.phone);

    const normalizedRecord: StaffRecord = {
      name,
      title,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    };

    const key = [
      normalizedRecord.name,
      normalizedRecord.title,
      normalizedRecord.email ?? "",
      normalizedRecord.phone ?? "",
    ]
      .join("|")
      .toLowerCase();

    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(normalizedRecord);
  }

  return normalized;
}

export function cleanText(value?: string | null): string {
  return stripLabels(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanTitle(value?: string | null): string {
  return stripLabels(value ?? "")
    .replace(/\u00a0/g, " ")
    .split(/\r?\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(", ");
}

export function firstEmail(value?: string | null): string | undefined {
  const match = stripLabels(value ?? "")
    .replace(/^.*mailto:/i, "mailto:")
    .match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return match?.[0].toLowerCase();
}

export function firstPhone(value?: string | null): string | undefined {
  const cleaned = stripLabels(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return undefined;

  const match = cleaned.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]\d{4}|\d{3}-\d{4}/);
  return match?.[0].trim();
}

export function extractGenericStaffRecords(html: string): StaffRecord[] {
  const $ = cheerio.load(html);
  const records: RawStaffRecord[] = [];

  records.push(...extractGenericTableRows($));
  records.push(...extractGenericCardRows($));
  records.push(...extractGenericTextRows($));

  return preferRicherRecordsByNameAndTitle(normalizeStaffRecords(records));
}

function preferRicherRecordsByNameAndTitle(records: StaffRecord[]): StaffRecord[] {
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

function extractGenericTableRows($: cheerio.CheerioAPI): RawStaffRecord[] {
  const records: RawStaffRecord[] = [];

  $("tr").each((_, row) => {
    const cells = $(row).find("th, td").toArray();
    if (cells.length < 2) return;

    const mapped: RawStaffRecord = {};
    const looseText: string[] = [];

    for (const cell of cells) {
      const cellNode = $(cell);
      const label = (cellNode.attr("data-title") ??
        cellNode.attr("headers") ??
        cellNode.attr("aria-label") ??
        cellNode.attr("class") ??
        "")
        .replace(/[_-]+/g, " ")
        .toLowerCase();
      const value = cellNode.text();
      const emailLink = cellNode.find('a[href*="mailto:"]').attr("href");
      const phoneLink = cellNode.find('a[href*="tel:"]').text() || cellNode.find('a[href*="tel:"]').attr("href");

      if (isNameLabel(label)) mapped.name ??= value;
      else if (isTitleLabel(label)) mapped.title ??= value;
      else if (isEmailLabel(label)) mapped.email ??= emailLink ?? value;
      else if (isPhoneLabel(label)) mapped.phone ??= phoneLink ?? value;
      else looseText.push(value);

      mapped.email ??= emailLink;
      mapped.phone ??= phoneLink;
    }

    const normalized = normalizeStaffRecords([mapped]);
    if (normalized.length > 0) {
      records.push(mapped);
      return;
    }

    const values = looseText.map(cleanText).filter(Boolean);
    if (values.length >= 2) {
      records.push({
        name: values[0],
        title: values[1],
        email: values.find((value) => firstEmail(value)),
        phone: values.find((value) => firstPhone(value)),
      });
    }
  });

  return records;
}

function extractGenericCardRows($: cheerio.CheerioAPI): RawStaffRecord[] {
  const records: RawStaffRecord[] = [];
  const selector = [
    '[class*="staff"]',
    '[class*="person"]',
    '[class*="profile"]',
    '[class*="directory"]',
    '[class*="coach"]',
    '[class*="card"]',
    '[itemtype*="Person"]',
  ].join(",");

  $(selector).each((_, element) => {
    const card = $(element);
    if (card.find(selector).length > 0) return;

    const emailLink = card.find('a[href*="mailto:"]').first();
    const phoneLink = card.find('a[href*="tel:"]').first();
    const text = card.text();
    if (!firstEmail(emailLink.attr("href") ?? text) && !firstPhone(phoneLink.text() || (phoneLink.attr("href") ?? text))) {
      return;
    }

    const name = firstNonEmptyText(card, [
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
    const title = firstNonEmptyText(card, [
      '[class*="title"]',
      '[class*="position"]',
      '[class*="role"]',
      '[class*="job"]',
      "p",
      "div",
    ], name);

    records.push({
      name,
      title,
      email: emailLink.attr("href") ?? emailLink.text() ?? text,
      phone: phoneLink.text() || phoneLink.attr("href") || text,
    });
  });

  return records;
}

function extractGenericTextRows($: cheerio.CheerioAPI): RawStaffRecord[] {
  const bodyText = $("body").text() || $.root().text();
  const lines = bodyText
    .split(/\r?\n+/)
    .map(cleanText)
    .filter(Boolean)
    .filter((line) => !/^(staff directory|search|filter|print|download|menu|home)$/i.test(line));
  const records: RawStaffRecord[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const window = lines.slice(index, index + 6);
    const emailLine = window.find((line) => firstEmail(line));
    const phoneLine = window.find((line) => firstPhone(line));
    if (!emailLine && !phoneLine) continue;

    const nameIndex = window.findIndex(isLikelyPersonName);
    if (nameIndex === -1) continue;

    const title = window
      .slice(nameIndex + 1)
      .find((line) => line !== emailLine && line !== phoneLine && isLikelyTitle(line));

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

function firstNonEmptyText(
  root: cheerio.Cheerio<any>,
  selectors: string[],
  except?: string | null,
): string | undefined {
  const exceptText = cleanText(except);

  for (const selector of selectors) {
    const direct = cleanText(root.children(selector).first().text());
    if (direct && direct !== exceptText) return direct;

    const nested = cleanText(root.find(selector).first().text());
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
  return words.length >= 2 && words.length <= 5 && words.every((word) => /^[A-Z][A-Za-z'.-]+,?$/.test(word));
}

function isLikelyTitle(line: string): boolean {
  if (line.length > 100 || /@/.test(line)) return false;
  return /director|coach|coordinator|assistant|associate|athletic|athletics|administrator|trainer|nutrition|counselor|psychologist|operations|communications|compliance|president|staff/i.test(line);
}

export function extractSidearmStaffRows(html: string): RawStaffRecord[] {
  const $ = cheerio.load(html);
  const rows: RawStaffRecord[] = [];

  $("tr.sidearm-staff-member").each((_, element) => {
    const row = $(element);
    const nameCell = row.find('[headers*="col-fullname"], th');
    const titleCell = row.find('[headers*="col-staff_title"]');
    const phoneCell = row.find('[headers*="col-staff_phone"]');
    const emailCell = row.find('[headers*="col-staff_email"]');
    const emailLink = emailCell.find('a[href*="mailto:"]');

    rows.push({
      name: nameCell.text(),
      title: titleCell.text(),
      phone: phoneCell.text(),
      email: emailLink.attr("href") ?? emailCell.text(),
    });
  });

  if (rows.length > 0) return rows;

  $('a[href*="staff-directory"]').each((_, element) => {
    const link = $(element);
    const aria = link.attr("aria-label") ?? "";
    const ariaParts = aria.split(":").map((part) => part.trim()).filter(Boolean);
    let cursor = element.nextSibling;
    let email: string | null | undefined;
    let phone: string | null | undefined;
    let text = "";

    while (cursor && !($(cursor).is('a[href*="staff-directory"]'))) {
      const nodeText = $(cursor).text() || (cursor.nodeType === 3 ? cursor.nodeValue : "");
      text += ` ${nodeText ?? ""}`;

      if (!email && $(cursor).is('a[href*="mailto:"]')) {
        email = $(cursor).attr("href") ?? $(cursor).text();
      }

      if (!phone && $(cursor).is('a[href*="tel:"]')) {
        phone = $(cursor).text() || $(cursor).attr("href");
      }

      cursor = cursor.nextSibling;
    }

    rows.push({
      name: link.text(),
      title: ariaParts.length >= 3 ? ariaParts[1] : undefined,
      phone: phone ?? text,
      email,
    });
  });

  return rows;
}

function stripLabels(value: string): string {
  return value.replace(/^(?:name|title|phone|e-?mail|email)\s*:?\s*/i, "");
}
