import * as cheerio from "cheerio";
import type { StaffRecord } from "../school.types";
import { extractSidearmStaffRows, normalizeStaffRecords } from "./scraper-utils";

export function getStaffGeorgiaCurrent(html: string): StaffRecord[] {
  const $ = cheerio.load(html);
  const records: any[] = [];

  $(".s-person-card").each((_, card) => {
    const name = $(card).find("h4").text();
    const title = $(card).find(".s-person-details__position").text();
    const emailLink = $(card).find('a[href^="mailto:"]');
    const phoneLink = $(card).find('a[href^="tel:"]');

    records.push({
      name,
      title,
      email: emailLink.attr("href") ?? emailLink.text(),
      phone: phoneLink.text() || phoneLink.attr("href"),
    });
  });

  return normalizeStaffRecords(records);
}

export function getStaffGeorgiaSnapshot(html: string): StaffRecord[] {
  return normalizeStaffRecords(extractSidearmStaffRows(html));
}
