import type { StaffRecord } from "../school.types";
import { extractSidearmStaffRows, normalizeStaffRecords } from "./scraper-utils";
import type { StaffScraperContext } from "./types";

export async function getStaffVirginiaTechCurrent({
  page,
}: StaffScraperContext): Promise<StaffRecord[]> {
  const records = await page
    .locator("tr.staff-directory-table-member-position")
    .evaluateAll((rows) =>
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
          email: emailLink?.getAttribute("href") ?? emailCell?.textContent,
          phone: phoneLink?.textContent ?? phoneCell?.textContent,
        };
      }),
    );

  if (records.length > 0) return normalizeStaffRecords(records);

  const flattenedRecords = await page
    .locator('a.staff-directory-table-member-position__link--name')
    .evaluateAll((links) =>
      links.map((link) => {
        let cursor = link.nextElementSibling;
        let title: string | null | undefined;
        let email: string | null | undefined;
        let phone: string | null | undefined;

        while (cursor && !cursor.matches('a.staff-directory-table-member-position__link--name')) {
          if (!title && cursor.tagName.toLowerCase() === "p") {
            title = cursor.textContent;
          }

          if (!email && cursor.matches('a[href^="mailto:"]')) {
            email = cursor.getAttribute("href") ?? cursor.textContent;
          }

          if (!phone && cursor.matches('a[href^="tel:"]')) {
            phone = cursor.textContent ?? cursor.getAttribute("href");
          }

          cursor = cursor.nextElementSibling;
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

export async function getStaffVirginiaTechSnapshot({
  page,
}: StaffScraperContext): Promise<StaffRecord[]> {
  return normalizeStaffRecords(await extractSidearmStaffRows(page));
}
