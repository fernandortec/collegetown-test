import { getStaffGeorgiaCurrent, getStaffGeorgiaSnapshot } from "./scrapers/georgia";
import { getStaffVirginiaTechCurrent, getStaffVirginiaTechSnapshot } from "./scrapers/virginia-tech";
import { getStaffWittenbergCurrent, getStaffWittenbergSnapshot } from "./scrapers/wittenberg";
import type { School } from "./school.types";

export const schools: School[] = [
  {
    id: "georgia",
    name: "University of Georgia",
    shortName: "Georgia",
    conference: "SEC",
    monogram: "UGA",
    colors: {
      primary: "#BA0C2F",
      secondary: "#000000",
      accent: "#FFFFFF",
      text: "#FFFFFF",
    },
    currentUrl: "https://georgiadogs.com/staff-directory",
    defaultSnapshotId: "georgia-2022",
    snapshots: [
      {
        id: "georgia-2022",
        label: "Georgia — 2022 Wayback snapshot",
        year: 2022,
        capturedAt: "2022-07-01",
        url: "https://web.archive.org/web/20220701000000/https://georgiadogs.com/staff-directory",
      },
    ],
    scrapers: {
      current: {
        readySelector: ".s-person-card",
        scrape: getStaffGeorgiaCurrent,
      },
      archive: {
        readySelector: "tr.sidearm-staff-member",
        scrape: getStaffGeorgiaSnapshot,
      },
    },
  },
  {
    id: "virginia-tech",
    name: "Virginia Tech",
    shortName: "Virginia Tech",
    conference: "ACC",
    monogram: "VT",
    colors: {
      primary: "#861F41",
      secondary: "#E5751F",
      accent: "#FFFFFF",
      text: "#FFFFFF",
    },
    currentUrl: "https://hokiesports.com/staff-directory",
    defaultSnapshotId: "virginia-tech-2022",
    snapshots: [
      {
        id: "virginia-tech-2022",
        label: "Virginia Tech — 2022 Wayback snapshot",
        year: 2022,
        capturedAt: "2022-07-01",
        url: "https://web.archive.org/web/20220701000000/https://hokiesports.com/staff-directory",
      },
    ],
    scrapers: {
      current: {
        readySelector: "tr.staff-directory-table-member-position",
        scrape: getStaffVirginiaTechCurrent,
      },
      archive: {
        readySelector: "tr.sidearm-staff-member",
        scrape: getStaffVirginiaTechSnapshot,
      },
    },
  },
  {
    id: "wittenberg",
    name: "Wittenberg University",
    shortName: "Wittenberg",
    conference: "NCAC",
    monogram: "W",
    colors: {
      primary: "#C8102E",
      secondary: "#000000",
      accent: "#FFFFFF",
      text: "#FFFFFF",
    },
    currentUrl: "https://wittenbergtigers.com/information/directory",
    defaultSnapshotId: "wittenberg-2021",
    snapshots: [
      {
        id: "wittenberg-2021",
        label: "Wittenberg — 2021 Wayback snapshot",
        year: 2021,
        capturedAt: "2021-07-01",
        url: "https://web.archive.org/web/20210701000000/https://wittenbergtigers.com/information/directory/index",
      },
    ],
    scrapers: {
      current: {
        readySelector: 'tr:has(td[data-title="Name"], td[data-title="name"])',
        scrape: getStaffWittenbergCurrent,
      },
      archive: {
        readySelector: 'tr:has(td[data-title="Name"], td[data-title="name"])',
        scrape: getStaffWittenbergSnapshot,
      },
    },
  },
];
