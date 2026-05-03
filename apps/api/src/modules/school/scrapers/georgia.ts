import type { Page } from "playwright";

import type { StaffRecord } from "../school.types";
import { extractSidearmStaffRows, normalizeStaffRecords } from "./scraper-utils";

export async function getStaffGeorgiaCurrent(page: Page): Promise<StaffRecord[]> {
  const records = await page.$$eval(".s-person-card", (cards) =>
    cards.map((card) => {
      const emailLink = card.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
      const phoneLink = card.querySelector<HTMLAnchorElement>('a[href^="tel:"]');

      return {
        name: card.querySelector("h4")?.textContent,
        title: card.querySelector(".s-person-details__position")?.textContent,
        email: emailLink?.href ?? emailLink?.textContent,
        phone: phoneLink?.textContent || phoneLink?.href,
      };
    }),
  );

  return normalizeStaffRecords(records);
}

export async function getStaffGeorgiaSnapshot(page: Page): Promise<StaffRecord[]> {
  return normalizeStaffRecords(await extractSidearmStaffRows(page));
}
