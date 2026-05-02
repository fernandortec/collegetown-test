import {
  getStaffGeorgiaCurrent,
  getStaffGeorgiaSnapshot,
} from "./georgia";
import type { StaffScraperRegistry } from "./types";
import {
  getStaffVirginiaTechCurrent,
  getStaffVirginiaTechSnapshot,
} from "./virginia-tech";
import {
  getStaffWittenbergCurrent,
  getStaffWittenbergSnapshot,
} from "./wittenberg";

export const staffScraperRegistry: StaffScraperRegistry = {
  georgia: {
    current: {
      readySelector: ".s-person-card",
      scrape: getStaffGeorgiaCurrent,
    },
    archive: {
      readySelector: "tr.sidearm-staff-member",
      scrape: getStaffGeorgiaSnapshot,
    },
  },
  "virginia-tech": {
    current: {
      readySelector: "tr.staff-directory-table-member-position",
      scrape: getStaffVirginiaTechCurrent,
    },
    archive: {
      readySelector: "tr.sidearm-staff-member",
      scrape: getStaffVirginiaTechSnapshot,
    },
  },
  wittenberg: {
    current: {
      readySelector: 'tr:has(td[data-title="Name"])',
      scrape: getStaffWittenbergCurrent,
    },
    archive: {
      readySelector: 'tr:has(td[data-title="Name"])',
      scrape: getStaffWittenbergSnapshot,
    },
  },
};
