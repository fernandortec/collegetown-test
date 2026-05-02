import type { Hono } from "hono";
import type { ErrorResponse } from "../../http/responses";
import type { SchoolResponse, SchoolsResponse } from "./school.types";
import * as services from "./school.service";

export function registerSchoolRoutes(app: Hono): void {
  app.get("/api/schools", (c) =>
    c.json<SchoolsResponse>({ schools: services.listSchools() }),
  );

  app.get("/api/schools/:schoolId", (c) => {
    const schoolId = c.req.param("schoolId");
    const school = services.getSchoolById(schoolId);

    if (!school) {
      return c.json<ErrorResponse>(
        {
          error: {
            code: "SCHOOL_NOT_FOUND",
            message: `School '${schoolId}' is not in the Better VPing catalog.`,
            details: { schoolId },
          },
        },
        404,
      );
    }

    return c.json<SchoolResponse>({ school });
  });
}
