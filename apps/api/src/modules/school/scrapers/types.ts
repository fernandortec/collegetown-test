import type { Page } from "playwright";

import type { SchoolId, StaffRecord } from "../school.types";

export type ExtractionSource = "current" | "archive";

export type StaffScraperContext = {
  page: Page;
};

export type StaffScraperConfig = {
  readySelector: string;
  scrape: (context: StaffScraperContext) => Promise<StaffRecord[]>;
};

export type StaffScraperRegistry = Record<
  SchoolId,
  Record<ExtractionSource, StaffScraperConfig>
>;
