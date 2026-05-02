import { getJson } from "../../../services/api";
import { schoolsResponseSchema, type School } from "../schemas";

export async function fetchSchools(): Promise<School[]> {
  const jsonData = await getJson("/api/schools");
  const parsedData = schoolsResponseSchema.parse(jsonData);

  return parsedData.schools;
}
