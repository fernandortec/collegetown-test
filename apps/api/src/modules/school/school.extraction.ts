import { chromium, errors as playwrightErrors, type Browser, type Page } from "playwright";
import { z } from "zod";

import { extractGenericStaffRecords } from "./scrapers/scraper-utils";
import type { School, SchoolId, StaffRecord } from "./school.types";

export type ExtractionSource = "current" | "archive";

export class StaffExtractionError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: 500 | 502 | 504,
    readonly details: Record<string, unknown>,
  ) {
    super(message);
    this.name = "StaffExtractionError";
  }
}

const pageTimeoutMs = 25000;

const staffRecordSchema = z
  .object({
    name: z.string().min(1),
    title: z.string().min(1),
    email: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
  })
  .strict();

export async function withStaffExtractionBrowser<T>(
  action: (browser: Browser) => Promise<T>,
): Promise<T> {
  let browser: Browser;

  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    throw new StaffExtractionError(
      "BROWSER_LAUNCH_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to launch Playwright browser.",
      502,
      {},
    );
  }

  try {
    return await action(browser);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

export async function extractStaffRecordsFromPage({
  browser,
  school,
  source,
  url,
}: {
  browser: Browser;
  school: School;
  source: ExtractionSource;
  url: string;
}): Promise<StaffRecord[]> {
  const page = await browser.newPage();
  page.setDefaultTimeout(pageTimeoutMs);
  page.setDefaultNavigationTimeout(pageTimeoutMs);

  try {
    const config = school.scrapers[source];

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: pageTimeoutMs,
    });

    await page
      .waitForLoadState("networkidle", { timeout: 5_000 })
      .catch(() => undefined);

    await cleanupPageChrome(page);

    await page
      .waitForSelector(config.readySelector, {
        timeout: pageTimeoutMs,
      })
      .catch(() => undefined);

    const html = await page.content();
    const schoolSpecificRecords = await config.scrape(html);
    const scrapedRecords =
      schoolSpecificRecords.length > 0
        ? schoolSpecificRecords
        : extractGenericStaffRecords(html);

    const records = sanitizeStaffRecords(scrapedRecords, {
      schoolId: school.id,
      source,
      url,
    });

    if (records.length === 0) {
      throw new StaffExtractionError(
        "EMPTY_EXTRACTION",
        `No staff records were extracted from the ${source} source.`,
        502,
        { schoolId: school.id, source, url },
      );
    }

    return records;
  } catch (error) {
    if (error instanceof StaffExtractionError) throw error;

    if (error instanceof playwrightErrors.TimeoutError) {
      throw new StaffExtractionError(
        "PAGE_TIMEOUT",
        `Timed out rendering the ${source} source after ${pageTimeoutMs}ms.`,
        504,
        { schoolId: school.id, source, url, timeoutMs: pageTimeoutMs },
      );
    }

    throw new StaffExtractionError(
      "PAGE_RENDER_FAILED",
      error instanceof Error
        ? error.message
        : `Failed to render the ${source} source.`,
      502,
      { schoolId: school.id, source, url },
    );
  } finally {
    await page.close().catch(() => undefined);
  }
}

async function cleanupPageChrome(page: Page): Promise<void> {
  await page.evaluate(() => {
    const selectors = [
      "script",
      "style",
      "link[rel='stylesheet']",
      "link[as='style']",
      "meta",
      "noscript",
      "template",
      "svg",
      "canvas",
      "iframe",
      "object",
      "embed",
      "img",
      "picture",
      "source",
      "video",
      "audio",
      "track",
      "form button",
      "form input",
      "form select",
      "form textarea",
      "nav",
      "header",
      "footer",
      "aside",
      '[role="navigation"]',
      '[role="banner"]',
      '[role="contentinfo"]',
      '[aria-hidden="true"]',
      "[hidden]",
      ".sr-only",
      ".visually-hidden",
      ".skip-link",
      "#wm-ipp",
      "#wm-ipp-base",
      ".wb-autocomplete-suggestions",
    ];

    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      element.remove();
    });
  });
}

function sanitizeStaffRecords(
  records: StaffRecord[],
  details: { schoolId: SchoolId; source: ExtractionSource; url: string },
): StaffRecord[] {
  const sanitized = records.map((record) => ({
    name: record.name.trim(),
    title: record.title.trim(),
    ...(record.email?.trim() ? { email: record.email.trim().toLowerCase() } : {}),
    ...(record.phone?.trim() ? { phone: record.phone.trim() } : {}),
  }));

  const parsedRecords = z.array(staffRecordSchema).safeParse(sanitized);

  if (!parsedRecords.success) {
    throw new StaffExtractionError(
      "MALFORMED_SCRAPER_OUTPUT",
      `Scraper returned malformed staff records for the ${details.source} source.`,
      502,
      { ...details, issues: parsedRecords.error.issues },
    );
  }

  const seen = new Set<string>();

  return parsedRecords.data.filter((record) => {
    const key = [
      record.name,
      record.title,
      record.email ?? "",
      record.phone ?? "",
    ]
      .join("|")
      .toLowerCase();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
