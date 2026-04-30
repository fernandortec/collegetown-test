import { schools } from "./school.catalog";
import type { School } from "./school.types";

export function listSchools(): School[] {
  return schools;
}

export function getSchoolById(schoolId: string): School | undefined {
  return schools.find((school) => school.id === schoolId);
}
