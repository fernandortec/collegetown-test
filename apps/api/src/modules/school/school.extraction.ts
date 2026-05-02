import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { chromium, errors as playwrightErrors, type Browser } from "playwright";
import { z } from "zod";

import { env } from "../../env";
import type { StaffRecord } from "./school.types";

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

const staffExtractionSchema = z
  .object({
    records: z.array(staffRecordSchema),
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
  url,
  source,
}: {
  browser: Browser;
  url: string;
  source: ExtractionSource;
}): Promise<StaffRecord[]> {
  const visibleText = await renderVisibleText(browser, url, source);
  const records = await extractStaffRecordsWithAi(visibleText, source, url);

  if (records.length === 0) {
    throw new StaffExtractionError(
      "EMPTY_EXTRACTION",
      `No staff records were extracted from the ${source} source.`,
      502,
      { source, url },
    );
  }

  return records;
}

async function renderVisibleText(
  browser: Browser,
  url: string,
  source: ExtractionSource,
): Promise<string> {
  const page = await browser.newPage();
  page.setDefaultTimeout(pageTimeoutMs);
  page.setDefaultNavigationTimeout(pageTimeoutMs);

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: pageTimeoutMs,
    });

    await page
      .waitForLoadState("networkidle", { timeout: 5_000 })
      .catch(() => undefined);

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
        "form",
        "button",
        "input",
        "select",
        "textarea",
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

    const text = await page.evaluate(() => document.body?.innerText ?? "");
    const cleanedText = normalizeVisibleText(text);

    if (!cleanedText) {
      throw new StaffExtractionError(
        "EMPTY_PAGE_TEXT",
        `No visible text was found in the ${source} source after cleanup.`,
        502,
        { source, url },
      );
    }

    return cleanedText;
  } catch (error) {
    if (error instanceof StaffExtractionError) throw error;

    if (error instanceof playwrightErrors.TimeoutError) {
      throw new StaffExtractionError(
        "PAGE_TIMEOUT",
        `Timed out rendering the ${source} source after ${pageTimeoutMs}ms.`,
        504,
        { source, url, timeoutMs: pageTimeoutMs },
      );
    }

    throw new StaffExtractionError(
      "PAGE_RENDER_FAILED",
      error instanceof Error
        ? error.message
        : `Failed to render the ${source} source.`,
      502,
      { source, url },
    );
  } finally {
    await page.close().catch(() => undefined);
  }
}

async function extractStaffRecordsWithAi(
  visibleText: string,
  source: ExtractionSource,
  url: string,
): Promise<StaffRecord[]> {
  const google = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_AI_API_KEY?.trim(),
  });

  try {
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      temperature: 0,
      system:
        "Extract athletics staff directory records from the provided visible page text. Use only the text provided. Do not search, infer, invent names, or fill missing contact fields. Return people only, not navigation labels, sponsors, sports, addresses, or page chrome. A valid record requires a person's name and job title. Include email and phone only when present in the text.",
      prompt: [
        `Source: ${source}`,
        `URL: ${url}`,
        "Visible page text:",
        visibleText,
      ].join("\n\n"),
      output: Output.object({
        schema: staffExtractionSchema,
      }),
    });

    const parsedRecords = staffExtractionSchema.safeParse(result.output);

    if (!parsedRecords.success) {
      throw new StaffExtractionError(
        "MALFORMED_AI_OUTPUT",
        `Gemini returned malformed staff records for the ${source} source.`,
        502,
        { source, url, issues: parsedRecords.error.issues },
      );
    }

    return sanitizeStaffRecords(parsedRecords.data.records, source, url);
  } catch (error) {
    if (error instanceof StaffExtractionError) throw error;

    throw new StaffExtractionError(
      "MALFORMED_AI_OUTPUT",
      error instanceof Error
        ? error.message
        : `Gemini returned malformed staff records for the ${source} source.`,
      502,
      { source, url },
    );
  }
}

function sanitizeStaffRecords(
  records: StaffRecord[],
  source: ExtractionSource,
  url: string,
): StaffRecord[] {
  const sanitized = records.map((record) => ({
    name: record.name.trim(),
    title: record.title.trim(),
    ...(record.email?.trim() ? { email: record.email.trim() } : {}),
    ...(record.phone?.trim() ? { phone: record.phone.trim() } : {}),
  }));

  const parsedRecords = z.array(staffRecordSchema).safeParse(sanitized);

  if (!parsedRecords.success) {
    throw new StaffExtractionError(
      "MALFORMED_AI_OUTPUT",
      `Gemini returned malformed staff records for the ${source} source.`,
      502,
      { source, url, issues: parsedRecords.error.issues },
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

function normalizeVisibleText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
