import type { Page } from "playwright";

import type { StaffRecord } from "../school.types";
import { normalizeStaffRecords, RawStaffRecord } from "./scraper-utils";

export function getStaffWittenbergCurrent(page: Page): Promise<StaffRecord[]> {
  return getStaffFromDataTitleRows(page);
}

export function getStaffWittenbergSnapshot(page: Page): Promise<StaffRecord[]> {
  return getStaffFromDataTitleRows(page);
}

async function getStaffFromDataTitleRows(page: Page): Promise<StaffRecord[]> {
  const records = await page.$$eval('tr:has(td[data-title="Name"])', (rows) =>
    rows.map((row) => {
      const nameCell = row.querySelector('td[data-title="Name"], td[data-title="name"]');
      const titleCell = row.querySelector('td[data-title="Title"], td[data-title="title"]');
      const phoneCell = row.querySelector('td[data-title="Phone"], td[data-title="phone"]');
      const emailCell = row.querySelector(
        'td[data-title="E-mail"], td[data-title="e-mail"], td[data-title="Email"], td[data-title="email"]',
      );
      const emailLink = emailCell?.querySelector<HTMLAnchorElement>('a[href*="mailto:"]');

      return {
        name: nameCell?.textContent,
        title: titleCell?.textContent,
        phone: phoneCell?.textContent,
        email: emailLink?.href ?? emailCell?.textContent,
      };
    }),
  );

  const flattenedRecords: RawStaffRecord[] = await page.$$eval(
    'a[href*="/information/directory/bios/"]',
    (links) =>
      links.map((link) => {
        let cursor = link.nextSibling;
        let title: string | null | undefined;
        let email: string | null | undefined;
        let phoneText = "";

        while (cursor) {
          if (
            cursor instanceof HTMLAnchorElement &&
            cursor.href.includes("/information/directory/bios/")
          ) {
            break;
          }

          if (!title && cursor instanceof HTMLElement && cursor.tagName.toLowerCase() === "div") {
            title = cursor.textContent;
          } else if (
            !email &&
            cursor instanceof HTMLAnchorElement &&
            cursor.href.includes("mailto:")
          ) {
            email = cursor.href || cursor.textContent;
          } else if (cursor.nodeType === Node.TEXT_NODE) {
            phoneText += ` ${cursor.nodeValue ?? ""}`;
          }

          cursor = cursor.nextSibling;
        }

        return {
          name: link.textContent,
          title,
          phone: phoneText,
          email,
        };
      }),
  );

  return normalizeStaffRecords([...records, ...flattenedRecords]);
}
