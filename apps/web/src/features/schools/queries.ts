import { useQuery } from "@tanstack/react-query";
import { getJson } from "../../services/api";
import {
  diffReportSchema,
  schoolsResponseSchema,
  type DiffReport,
  type School,
} from "./schemas";

const oneHourMs = 60 * 60 * 1000;

export const schoolQueryKeys = {
  all: ["schools"] as const,
  diff: (schoolId: string) => ["schools", schoolId, "diff"] as const,
};

export async function fetchSchools(): Promise<School[]> {
  const jsonData = await getJson("/api/schools");
  const parsedData = schoolsResponseSchema.parse(jsonData);
  return parsedData.schools;
}

export async function fetchDiffReport(schoolId: string): Promise<DiffReport> {
  const jsonData = await getJson(`/api/schools/${schoolId}/diff`);
  return diffReportSchema.parse(jsonData);
}

export function useSchoolsQuery() {
  return useQuery({
    queryKey: schoolQueryKeys.all,
    queryFn: fetchSchools,
    staleTime: oneHourMs,
    gcTime: oneHourMs,
  });
}

export function useSchoolDiffQuery(schoolId: string, enabled: boolean) {
  return useQuery({
    queryKey: schoolQueryKeys.diff(schoolId),
    queryFn: () => fetchDiffReport(schoolId),
    enabled,
    staleTime: oneHourMs,
    gcTime: oneHourMs,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
}
