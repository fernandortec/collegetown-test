 import type { StaffRecord } from "../school.types";
import { extractSidearmStaffRows, normalizeStaffRecords } from "./scraper-utils";
import type { StaffScraperContext } from "./types";

export async function getStaffGeorgiaCurrent({
  page,
}: StaffScraperContext): Promise<StaffRecord[]> {
  const records = await page.locator(".s-person-card").evaluateAll((cards) =>
    cards.map((card) => {
      const name = card.querySelector("h4")?.textContent;
      const title = card.querySelector(".s-person-details__position")?.textContent;
      const emailLink = card.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
      const phoneLink = card.querySelector<HTMLAnchorElement>('a[href^="tel:"]');

      return {
        name,
        title,
        email: emailLink?.getAttribute("href") ?? emailLink?.textContent,
        phone: phoneLink?.textContent ?? phoneLink?.getAttribute("href"),
      };
    }),
  );

  return normalizeStaffRecords(records);
}

export async function getStaffGeorgiaSnapshot({
  page,
}: StaffScraperContext): Promise<StaffRecord[]> {
  return normalizeStaffRecords(await extractSidearmStaffRows(page));
}
