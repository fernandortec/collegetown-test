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

export const schoolsResponseSchema = z.object({
  schools: z.array(schoolSchema),
});

export type School = z.infer<typeof schoolSchema>;
export type SchoolSnapshot = z.infer<typeof schoolSnapshotSchema>;
