export type SchoolId = "georgia" | "virginia-tech" | "wittenberg";
import type { Page } from "playwright";

export type SchoolSnapshot = {
  id: string;
  label: string;
  year: number;
  capturedAt: string;
  url: string;
};

export type SchoolColors = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
};

export type StaffRecord = {
  name: string;
  title: string;
  phone?: string;
  email?: string;
};

export type ChangeType = "added" | "removed" | "title_changed" | "contact_changed";

export type Change = {
  type: ChangeType;
  staffIdentity: string;
  before?: StaffRecord;
  after?: StaffRecord;
  importanceScore: number;
  explanation: string;
};


export type StaffScraperConfig = {
  readySelector: string;
  scrape: (page: Page) => Promise<StaffRecord[]> | StaffRecord[];
};

export type School = {
  id: SchoolId;
  name: string;
  shortName: string;
  conference: string;
  monogram: string;
  colors: SchoolColors;
  currentUrl: string;
  defaultSnapshotId: string;
  snapshots: SchoolSnapshot[];
  scrapers: {
    current: StaffScraperConfig;
    archive: StaffScraperConfig;
  };
};

export type PublicSchool = Omit<School, "scrapers">;

export type DiffReportStats = {
  currentCount: number;
  archivedCount: number;
  addedCount: number;
  removedCount: number;
  titleChangedCount: number;
  contactChangedCount: number;
  totalChanges: number;
};

export type DiffReport = {
  school: PublicSchool;
  sources: {
    currentUrl: string;
    archivedUrl: string;
    snapshotId: string;
    snapshotLabel: string;
  };
  generatedAt: string;
  currentStaff: StaffRecord[];
  archivedStaff: StaffRecord[];
  changes: Change[];
  topChanges: Change[];
  stats: DiffReportStats;
};

export type SchoolsResponse = {
  schools: PublicSchool[];
};

export type SchoolResponse = {
  school: PublicSchool;
};
