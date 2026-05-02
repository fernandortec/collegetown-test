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
};

export type SchoolsResponse = {
  schools: School[];
};

export type SchoolResponse = {
  school: School;
};
