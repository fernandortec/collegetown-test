import type { Page } from "playwright";

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

export async function extractSidearmStaffRows(page: Page): Promise<RawStaffRecord[]> {
  const rows = await page.locator("tr.sidearm-staff-member").evaluateAll((elements) =>
    elements.map((row) => {
      const nameCell = row.querySelector('[headers*="col-fullname"], th');
      const titleCell = row.querySelector('[headers*="col-staff_title"]');
      const phoneCell = row.querySelector('[headers*="col-staff_phone"]');
      const emailCell = row.querySelector('[headers*="col-staff_email"]');
      const emailLink = emailCell?.querySelector<HTMLAnchorElement>('a[href*="mailto:"]');

      return {
        name: nameCell?.textContent,
        title: titleCell?.textContent,
        phone: phoneCell?.textContent,
        email: emailLink?.getAttribute("href") ?? emailCell?.textContent,
      };
    }),
  );

  if (rows.length > 0) return rows;

  return page.locator('a[href*="staff-directory"]').evaluateAll((links) =>
    links.map((link) => {
      const aria = link.getAttribute("aria-label") ?? "";
      const ariaParts = aria.split(":").map((part) => part.trim()).filter(Boolean);
      let cursor = link.nextElementSibling;
      let email: string | null | undefined;
      let phone: string | null | undefined;
      let text = "";

      while (cursor && !cursor.matches('a[href*="staff-directory"]')) {
        text += ` ${cursor.textContent ?? ""}`;

        if (!email && cursor.matches('a[href*="mailto:"]')) {
          email = cursor.getAttribute("href") ?? cursor.textContent;
        }

        if (!phone && cursor.matches('a[href*="tel:"]')) {
          phone = cursor.textContent ?? cursor.getAttribute("href");
        }

        cursor = cursor.nextElementSibling;
      }

      return {
        name: link.textContent,
        title: ariaParts.length >= 3 ? ariaParts[1] : undefined,
        phone: phone ?? text,
        email,
      };
    }),
  );
}

function stripLabels(value: string): string {
  return value.replace(/^(?:name|title|phone|e-?mail|email)\s*:?\s*/i, "");
}
