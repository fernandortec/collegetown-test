import type { Hono } from "hono";
import { jsonError } from "../../http/responses";
import { StaffExtractionError } from "./school.extraction";
import * as services from "./school.service";
import type { SchoolResponse, SchoolsResponse } from "./school.types";

export function registerSchoolRoutes(app: Hono): void {
  app.get("/api/schools", (c) =>
    c.json<SchoolsResponse>({ schools: services.listSchools() }),
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

    return c.json<SchoolResponse>({ school });
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
      return c.json(await services.buildDiffReport(school));
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
          error instanceof Error ? error.message : "Failed to build diff report.",
      });
    }
  });
}
