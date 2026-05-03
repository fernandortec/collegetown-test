import { useQuery } from "@tanstack/react-query";
import { getJson, postJson } from "../../services/api";
import {
  diffReportSchema,
  emailDraftSchema,
  schoolsResponseSchema,
  type DiffReport,
  type EmailDraft,
  type School,
} from "./schemas";

const oneHourMs = 60 * 60 * 1000;

export const schoolQueryKeys = {
  all: ["schools"] as const,
  diff: (schoolId: string) => ["schools", schoolId, "diff"] as const,
  emailDraft: (schoolId: string, reportGeneratedAt: string) =>
    ["schools", schoolId, "email-draft", reportGeneratedAt] as const,
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

export async function fetchEmailDraft(report: DiffReport): Promise<EmailDraft> {
  const jsonData = await postJson(
    `/api/schools/${report.school.id}/email-draft`,
    {
      topChanges: report.topChanges,
      stats: report.stats,
    },
  );

  return emailDraftSchema.parse(jsonData);
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

export function useEmailDraftQuery(report: DiffReport) {
  return useQuery({
    queryKey: schoolQueryKeys.emailDraft(report.school.id, report.generatedAt),
    queryFn: () => fetchEmailDraft(report),
    enabled: report.topChanges.length > 0,
    staleTime: oneHourMs,
    gcTime: oneHourMs,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });
}
