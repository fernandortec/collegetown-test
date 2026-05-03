import * as cheerio from "cheerio";
import type { StaffRecord } from "../school.types";
import { extractSidearmStaffRows, normalizeStaffRecords } from "./scraper-utils";

export function getStaffVirginiaTechCurrent(html: string): StaffRecord[] {
  const $ = cheerio.load(html);
  const records: StaffRecord[] = [];

  $("tr.staff-directory-table-member-position").each((_, row) => {
    const nameCell = $(row).find(".staff-directory-table-member-position__name");
    const titleCell = $(row).find(".staff-directory-table-member-position__position");
    const emailCell = $(row).find(".staff-directory-table-member-position__email");
    const phoneCell = $(row).find(".staff-directory-table-member-position__phone");
    const emailLink = emailCell.find('a[href^="mailto:"]');
    const phoneLink = phoneCell.find('a[href^="tel:"]');

    records.push({
      name: nameCell.text(),
      title: titleCell.text(),
      email: emailLink.attr("href") ?? emailCell.text(),
      phone: phoneLink.text() || phoneCell.text(),
    });
  });

  if (records.length > 0) return normalizeStaffRecords(records);

  const flattenedRecords: any[] = [];

  $('a.staff-directory-table-member-position__link--name').each((_, link) => {
    let cursor = (link as any).nextSibling;
    let title: string | null | undefined;
    let email: string | null | undefined;
    let phone: string | null | undefined;

    while (cursor && !($(cursor).is('a.staff-directory-table-member-position__link--name'))) {
      if (!title && cursor.tagName && cursor.tagName.toLowerCase() === "p") {
        title = $(cursor).text();
      }

      if (!email && $(cursor).is('a[href^="mailto:"]')) {
        email = $(cursor).attr("href") ?? $(cursor).text();
      }

      if (!phone && $(cursor).is('a[href^="tel:"]')) {
        phone = $(cursor).text() || $(cursor).attr("href");
      }

      cursor = cursor.nextSibling;
    }

    flattenedRecords.push({
      name: $(link).text(),
      title,
      email,
      phone,
    });
  });

  return normalizeStaffRecords(flattenedRecords);
}

export function getStaffVirginiaTechSnapshot(html: string): StaffRecord[] {
  return normalizeStaffRecords(extractSidearmStaffRows(html));
}
