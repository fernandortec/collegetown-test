import type { Hono } from "hono";
import { jsonError } from "../../http/responses";
import {
  StaffExtractionError,
  extractStaffRecordsFromPage,
  withStaffExtractionBrowser,
} from "./school.extraction";
import * as services from "./school.service";
import type { SchoolResponse, SchoolsResponse } from "./school.types";

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

  app.get("/api/schools/:schoolId/diff", async (c) => {
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
