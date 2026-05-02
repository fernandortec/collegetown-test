import { useQuery } from "@tanstack/react-query";
import { fetchDiffReport, fetchSchools } from "./services/schools.service";

const oneHourMs = 60 * 60 * 1000;

export const schoolQueryKeys = {
  all: ["schools"] as const,
  diff: (schoolId: string) => ["schools", schoolId, "diff"] as const,
};

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
