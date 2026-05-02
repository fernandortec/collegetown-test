import type { Hono } from "hono";

import { jsonError } from "../../http/responses";
import * as services from "./school.service";
import type { SchoolResponse, SchoolsResponse } from "./school.types";

export function registerSchoolRoutes(app: Hono) {
  app.get("/api/schools", (c) =>
    c.json<SchoolsResponse>({ schools: services.listSchools() }),
  );

  app.get("/api/schools/:schoolId", (c) => {
    const schoolId = c.req.param("schoolId");
    const school = services.getSchoolById(schoolId);

    if (!school) {
      return jsonError(c, 404, {
        message: `School '${schoolId}' is not in the Better VPing catalog.`,
      });
    }

    return c.json<SchoolResponse>({ school });
  });

  app.get("/api/schools/:schoolId/diff", (c) => {
    const schoolId = c.req.param("schoolId");
    const school = services.getSchoolById(schoolId);

    if (!school) {
      return jsonError(c, 404, {
        message: `School '${schoolId}' is not in the Better VPing catalog.`,
      });
    }

    return c.json(services.buildMockDiffReport(school));
  });
}
