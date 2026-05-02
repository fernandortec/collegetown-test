import { getJson } from "../../../services/api";
import {
  diffReportSchema,
  schoolsResponseSchema,
  type DiffReport,
  type School,
} from "../schemas";

export async function fetchSchools(): Promise<School[]> {
  const jsonData = await getJson("/api/schools");
  const parsedData = schoolsResponseSchema.parse(jsonData);

  return parsedData.schools;
}

export async function fetchDiffReport(schoolId: string): Promise<DiffReport> {
  const jsonData = await getJson(`/api/schools/${schoolId}/diff`);
  return diffReportSchema.parse(jsonData);
}
