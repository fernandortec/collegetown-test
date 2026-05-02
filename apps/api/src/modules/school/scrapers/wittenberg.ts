import type { StaffRecord } from "../school.types";
import { normalizeStaffRecords } from "./scraper-utils";
import type { StaffScraperContext } from "./types";

export async function getStaffWittenbergCurrent({
  page,
}: StaffScraperContext): Promise<StaffRecord[]> {
  return getStaffFromDataTitleRows(page);
}

export async function getStaffWittenbergSnapshot({
  page,
}: StaffScraperContext): Promise<StaffRecord[]> {
  return getStaffFromDataTitleRows(page);
}

async function getStaffFromDataTitleRows(
  page: StaffScraperContext["page"],
): Promise<StaffRecord[]> {
  const records = await page.locator('tr:has(td[data-title="Name"])').evaluateAll(function (rows) {
    return rows.map(function (row) {
      const nameCell = row.querySelector('td[data-title="Name"], td[data-title="name"]');
      const titleCell = row.querySelector('td[data-title="Title"], td[data-title="title"]');
      const phoneCell = row.querySelector('td[data-title="Phone"], td[data-title="phone"]');
      const emailCell = row.querySelector('td[data-title="E-mail"], td[data-title="e-mail"], td[data-title="Email"], td[data-title="email"]');
      const emailLink = emailCell?.querySelector<HTMLAnchorElement>('a[href*="mailto:"]');

      return {
        name: nameCell?.textContent,
        title: titleCell?.textContent,
        phone: phoneCell?.textContent,
        email: emailLink?.getAttribute("href") ?? emailCell?.textContent,
      };
    });
  });

  const flattenedRecords = await page
    .locator('a[href*="/information/directory/bios/"]')
    .evaluateAll(function (links) {
      return links.map(function (link) {
        let cursor: ChildNode | null = link.nextSibling;
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

          if (!title && cursor instanceof HTMLDivElement) {
            title = cursor.textContent;
          } else if (!email && cursor instanceof HTMLAnchorElement && cursor.href.includes("mailto:")) {
            email = cursor.getAttribute("href") ?? cursor.textContent;
          } else if (cursor.nodeType === Node.TEXT_NODE) {
            phoneText += ` ${cursor.textContent ?? ""}`;
          }

          cursor = cursor.nextSibling;
        }

        return {
          name: link.textContent,
          title,
          phone: phoneText,
          email,
        };
      });
    });

  return normalizeStaffRecords([...records, ...flattenedRecords]);
}
