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
