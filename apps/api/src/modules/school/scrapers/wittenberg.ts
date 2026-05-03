import * as cheerio from "cheerio";
import type { StaffRecord } from "../school.types";
import { normalizeStaffRecords, RawStaffRecord } from "./scraper-utils";

export function getStaffWittenbergCurrent(html: string): StaffRecord[] {
  return getStaffFromDataTitleRows(html);
}

export function getStaffWittenbergSnapshot(html: string): StaffRecord[] {
  return getStaffFromDataTitleRows(html);
}

function getStaffFromDataTitleRows(html: string): StaffRecord[] {
  const $ = cheerio.load(html);
  const records: RawStaffRecord[] = [];

  $('tr:has(td[data-title="Name"])').each((_, row) => {
    const nameCell = $(row).find(
      'td[data-title="Name"], td[data-title="name"]',
    );
    const titleCell = $(row).find(
      'td[data-title="Title"], td[data-title="title"]',
    );
    const phoneCell = $(row).find(
      'td[data-title="Phone"], td[data-title="phone"]',
    );
    const emailCell = $(row).find(
      'td[data-title="E-mail"], td[data-title="e-mail"], td[data-title="Email"], td[data-title="email"]',
    );
    const emailLink = emailCell.find('a[href*="mailto:"]');

    records.push({
      name: nameCell.text(),
      title: titleCell.text(),
      phone: phoneCell.text(),
      email: emailLink.attr("href") ?? emailCell.text(),
    });
  });

  const flattenedRecords: RawStaffRecord[] = [];

  $('a[href*="/information/directory/bios/"]').each((_, link) => {
    let cursor = (link as any).nextSibling;
    let title: string | null | undefined;
    let email: string | null | undefined;
    let phoneText = "";

    while (cursor) {
      if (
        cursor.tagName &&
        cursor.tagName.toLowerCase() === "a" &&
        $(cursor).attr("href")?.includes("/information/directory/bios/")
      ) {
        break;
      }

      if (!title && cursor.tagName && cursor.tagName.toLowerCase() === "div") {
        title = $(cursor).text();
      } else if (
        !email &&
        cursor.tagName &&
        cursor.tagName.toLowerCase() === "a" &&
        $(cursor).attr("href")?.includes("mailto:")
      ) {
        email = $(cursor).attr("href") ?? $(cursor).text();
      } else if (cursor.nodeType === 3) {
        // TEXT_NODE
        phoneText += ` ${cursor.nodeValue ?? ""}`;
      }

      cursor = cursor.nextSibling;
    }

    flattenedRecords.push({
      name: $(link).text(),
      title,
      phone: phoneText,
      email,
    });
  });

  return normalizeStaffRecords([...records, ...flattenedRecords]);
}
