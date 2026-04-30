import { useQuery } from "@tanstack/react-query";
import { fetchSchools } from "./services/schools.service";

const oneHourMs = 60 * 60 * 1000;

export const schoolQueryKeys = {
  all: ["schools"] as const,
};

export function useSchoolsQuery() {
  return useQuery({
    queryKey: schoolQueryKeys.all,
    queryFn: fetchSchools,
    staleTime: oneHourMs,
  });
}
