export type SchoolId = "georgia" | "virginia-tech" | "wittenberg";

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

export type StaffScraperConfig = {
  readySelector: string;
  scrape: (html: string) => Promise<StaffRecord[]> | StaffRecord[];
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

export type DiffReportStats = {
  currentCount: number;
  archivedCount: number;
};

export type DiffReport = {
  school: School;
  sources: {
    currentUrl: string;
    archivedUrl: string;
    snapshotId: string;
    snapshotLabel: string;
  };
  generatedAt: string;
  currentStaff: StaffRecord[];
  archivedStaff: StaffRecord[];
  stats: DiffReportStats;
};

export type SchoolsResponse = {
  schools: School[];
};

export type SchoolResponse = {
  school: School;
};
