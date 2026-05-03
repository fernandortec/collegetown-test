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

export const changeSchema = z.object({
  type: z.enum(["added", "removed", "title_changed", "contact_changed"]),
  staffIdentity: z.string(),
  before: staffRecordSchema.optional(),
  after: staffRecordSchema.optional(),
  importanceScore: z.number(),
  explanation: z.string(),
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
  changes: z.array(changeSchema),
  topChanges: z.array(changeSchema),
  stats: z.object({
    currentCount: z.number(),
    archivedCount: z.number(),
    addedCount: z.number(),
    removedCount: z.number(),
    titleChangedCount: z.number(),
    contactChangedCount: z.number(),
    totalChanges: z.number(),
  }),
});

export const schoolsResponseSchema = z.object({
  schools: z.array(schoolSchema),
});

export type School = z.infer<typeof schoolSchema>;
export type SchoolSnapshot = z.infer<typeof schoolSnapshotSchema>;
export type StaffRecord = z.infer<typeof staffRecordSchema>;
export type Change = z.infer<typeof changeSchema>;
export type DiffReport = z.infer<typeof diffReportSchema>;
