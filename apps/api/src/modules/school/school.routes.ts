import type { Hono } from "hono";
import { jsonError } from "../../http/responses";
import {
  StaffExtractionError,
  extractStaffRecordsFromPage,
  withStaffExtractionBrowser,
} from "./school.extraction";
import { buildEmailDraft, emailDraftRequestSchema } from "./school.email";
import * as services from "./school.service";
import type { EmailDraft, SchoolResponse, SchoolsResponse } from "./school.types";

export function registerSchoolRoutes(app: Hono): void {
  app.get("/api/schools", (c) =>
    c.json<SchoolsResponse>({ schools: services.listPublicSchools() }),
  );

  app.get("/api/schools/:schoolId", (c) => {
    const schoolId = c.req.param("schoolId");
    const school = services.getSchoolById(schoolId);

    if (!school) {
      return jsonError(c, 404, {
        code: "SCHOOL_NOT_FOUND",
        message: `School '${schoolId}' is not in the Better VPing catalog.`,
        details: { schoolId },
      });
    }

    return c.json<SchoolResponse>({
      school: services.toPublicSchool(school),
    });
  });

  app.post("/api/schools/:schoolId/email-draft", async (c) => {
    c.header("Cache-Control", "no-store, max-age=0");

    const schoolId = c.req.param("schoolId");
    const school = services.getSchoolById(schoolId);

    if (!school) {
      return jsonError(c, 404, {
        code: "SCHOOL_NOT_FOUND",
        message: `School '${schoolId}' is not in the Better VPing catalog.`,
        details: { schoolId },
      });
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return jsonError(c, 400, {
        code: "INVALID_EMAIL_DRAFT_REQUEST",
        message: "Email draft request body must be valid JSON.",
      });
    }

    const parsedBody = emailDraftRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return jsonError(c, 400, {
        code: "INVALID_EMAIL_DRAFT_REQUEST",
        message: "Email draft request must include topChanges and stats from an existing diff report.",
        details: { issues: parsedBody.error.issues },
      });
    }

    const draft = await buildEmailDraft(school, parsedBody.data);
    return c.json<EmailDraft>(draft);
  });

  app.get("/api/schools/:schoolId/diff", async (c) => {
    c.header("Cache-Control", "no-store, max-age=0");

    const schoolId = c.req.param("schoolId");
    const school = services.getSchoolById(schoolId);

    if (!school) {
      return jsonError(c, 404, {
        code: "SCHOOL_NOT_FOUND",
        message: `School '${schoolId}' is not in the Better VPing catalog.`,
        details: { schoolId },
      });
    }

    try {
      const report = await withStaffExtractionBrowser(async (browser) => {
        const diff = await services.buildDiffReport(
          school,
          async (source, url) => {
            const staffRecords = await extractStaffRecordsFromPage({
              browser,
              school,
              source,
              url,
            });

            return staffRecords;
          },
        );

        return diff;
      });

      return c.json(report);
    } catch (error) {
      if (error instanceof StaffExtractionError) {
        return jsonError(c, error.status, {
          code: error.code,
          message: error.message,
          details: error.details,
        });
      }

      return jsonError(c, 500, {
        code: "DIFF_REPORT_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to build diff report.",
      });
    }
  });
}
