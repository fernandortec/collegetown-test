import { z } from "zod";

export const schoolSnapshotSchema = z.object({
  id: z.string(),
  label: z.string(),
  year: z.number(),
  capturedAt: z.string(),
  url: z.url(),
});

export const schoolSchema = z.object({
  id: z.enum(["georgia", "virginia-tech", "wittenberg"]),
  name: z.string(),
  shortName: z.string(),
  conference: z.string(),
  monogram: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    text: z.string(),
  }),
  currentUrl: z.url(),
  defaultSnapshotId: z.string(),
  snapshots: z.array(schoolSnapshotSchema).min(1),
});

export const staffRecordSchema = z.object({
  name: z.string(),
  title: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const diffReportSchema = z.object({
  school: schoolSchema,
  sources: z.object({
    currentUrl: z.url(),
    archivedUrl: z.url(),
    snapshotId: z.string(),
    snapshotLabel: z.string(),
  }),
  generatedAt: z.string(),
  currentStaff: z.array(staffRecordSchema),
  archivedStaff: z.array(staffRecordSchema),
  stats: z.object({
    currentCount: z.number(),
    archivedCount: z.number(),
  }),
});

export const schoolsResponseSchema = z.object({
  schools: z.array(schoolSchema),
});

export type School = z.infer<typeof schoolSchema>;
export type SchoolSnapshot = z.infer<typeof schoolSnapshotSchema>;
export type StaffRecord = z.infer<typeof staffRecordSchema>;
export type DiffReport = z.infer<typeof diffReportSchema>;
