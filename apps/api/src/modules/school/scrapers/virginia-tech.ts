import type { Page } from "playwright";

import type { StaffRecord } from "../school.types";
import { extractSidearmStaffRows, normalizeStaffRecords } from "./scraper-utils";

export async function getStaffVirginiaTechCurrent(page: Page): Promise<StaffRecord[]> {
  const records = await page.$$eval("tr.staff-directory-table-member-position", (rows) =>
    rows.map((row) => {
      const nameCell = row.querySelector(".staff-directory-table-member-position__name");
      const titleCell = row.querySelector(".staff-directory-table-member-position__position");
      const emailCell = row.querySelector(".staff-directory-table-member-position__email");
      const phoneCell = row.querySelector(".staff-directory-table-member-position__phone");
      const emailLink = emailCell?.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
      const phoneLink = phoneCell?.querySelector<HTMLAnchorElement>('a[href^="tel:"]');

      return {
        name: nameCell?.textContent,
        title: titleCell?.textContent,
        email: emailLink?.href ?? emailCell?.textContent,
        phone: phoneLink?.textContent || phoneCell?.textContent,
      };
    }),
  );

  if (records.length > 0) return normalizeStaffRecords(records);

  const flattenedRecords = await page.$$eval(
    'a.staff-directory-table-member-position__link--name',
    (links) =>
      links.map((link) => {
        let cursor = link.nextSibling;
        let title: string | null | undefined;
        let email: string | null | undefined;
        let phone: string | null | undefined;

        while (cursor) {
          if (
            cursor instanceof HTMLAnchorElement &&
            cursor.matches('a.staff-directory-table-member-position__link--name')
          ) {
            break;
          }

          if (!title && cursor instanceof HTMLElement && cursor.tagName.toLowerCase() === "p") {
            title = cursor.textContent;
          }

          if (!email && cursor instanceof HTMLAnchorElement && cursor.href.startsWith("mailto:")) {
            email = cursor.href || cursor.textContent;
          }

          if (!phone && cursor instanceof HTMLAnchorElement && cursor.href.startsWith("tel:")) {
            phone = cursor.textContent || cursor.href;
          }

          cursor = cursor.nextSibling;
        }

        return {
          name: link.textContent,
          title,
          email,
          phone,
        };
      }),
  );

  return normalizeStaffRecords(flattenedRecords);
}

export async function getStaffVirginiaTechSnapshot(page: Page): Promise<StaffRecord[]> {
  return normalizeStaffRecords(await extractSidearmStaffRows(page));
}
