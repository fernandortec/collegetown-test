import { generateText } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import { getDefaultSnapshot } from "./school.service";
import type { Change, EmailDraft, School } from "./school.types";

const staffRecordSchema = z
  .object({
    name: z.string().min(1),
    title: z.string().min(1),
    phone: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
  })
  .strict();

const changeSchema = z
  .object({
    type: z.enum(["added", "removed", "title_changed", "contact_changed"]),
    staffIdentity: z.string().min(1),
    before: staffRecordSchema.optional(),
    after: staffRecordSchema.optional(),
    importanceScore: z.number(),
    explanation: z.string().min(1),
  })
  .strict();

const statsSchema = z
  .object({
    currentCount: z.number(),
    archivedCount: z.number(),
    addedCount: z.number(),
    removedCount: z.number(),
    titleChangedCount: z.number(),
    contactChangedCount: z.number(),
    totalChanges: z.number(),
  })
  .strict();

export const emailDraftRequestSchema = z
  .object({
    topChanges: z.array(changeSchema).min(1).max(10),
    stats: statsSchema,
  })
  .strict();

export type EmailDraftRequest = z.infer<typeof emailDraftRequestSchema>;

export async function buildEmailDraft(
  school: School,
  request: EmailDraftRequest,
): Promise<EmailDraft> {
  const fallback = buildFallbackEmailDraft(school, request);
  const prompt = buildPrompt(school, request);

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      temperature: 0.2,
      prompt,
    });

    const parsed = parseAiDraft(text);
    if (!parsed) return fallback;

    return { ...parsed, fallback: false };
  } catch {
    return fallback;
  }
}

function buildPrompt(school: School, request: EmailDraftRequest): string {
  const snapshot = getDefaultSnapshot(school);

  return `Create a polished athletics staff-intelligence email draft.

          Rules:
          - Use only supplied school, snapshot, stats, and changes.
          - Do not invent reasons, outside news, names, context, motives, or next steps not shown in changes.
          - Body must contain 2 to 5 concise bullets, each starting with ➤.
          - Avoid leading with raw total-change count when it is noisy; emphasize notable top changes instead.
          - Keep tone premium, direct, useful to athletic department staff.
          - Return strict JSON only with keys: subject, summary, body.

          School: ${school.name}
          Snapshot: ${snapshot.label} (${snapshot.capturedAt})
          Stats: ${JSON.stringify(request.stats)}
          Top changes: ${JSON.stringify(request.topChanges)}`;
}

function parseAiDraft(text: string): Omit<EmailDraft, "fallback"> | undefined {
  const jsonText = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const schema = z
    .object({
      subject: z.string().min(1),
      summary: z.string().min(1),
      body: z.string().min(1),
    })
    .strict();

  try {
    const parsed = schema.parse(JSON.parse(jsonText));
    return {
      subject: parsed.subject.trim(),
      summary: parsed.summary.trim(),
      body: normalizeBullets(parsed.body),
    };
  } catch {
    return undefined;
  }
}

function buildFallbackEmailDraft(
  school: School,
  request: EmailDraftRequest,
): EmailDraft {
  const snapshot = getDefaultSnapshot(school);
  const topBullets = request.topChanges.slice(0, 5).map(formatChangeBullet);
  const bullets =
    topBullets.length >= 2
      ? topBullets
      : [
          `${school.shortName} shows ${request.stats.totalChanges} detected staff-directory changes since ${snapshot.label}.`,
          `Current directory lists ${request.stats.currentCount} staff vs ${request.stats.archivedCount} in archive.`,
        ];

  return {
    subject: `${school.shortName} staff update: notable moves since ${snapshot.year}`,
    summary: `Notable ${school.shortName} staff-directory moves surfaced from the current site vs. ${snapshot.label}. Focus below stays on the highest-impact changes, not every directory edit.`,
    body: normalizeBullets(
      bullets
        .slice(0, 5)
        .map((bullet) => `➤ ${bullet}`)
        .join("\n"),
    ),
    fallback: true,
  };
}

function formatChangeBullet(change: Change): string {
  const person =
    change.after?.name ?? change.before?.name ?? change.staffIdentity;

  if (change.type === "added") {
    return `Notable add: ${person} — ${change.after?.title ?? "staff"}.`;
  }

  if (change.type === "removed") {
    return `Departure/removal: ${person} — ${change.before?.title ?? "previous role"}.`;
  }

  if (change.type === "title_changed") {
    return `Title update: ${person} moved from ${change.before?.title ?? "previous title"} to ${change.after?.title ?? "current title"}.`;
  }

  return `Contact update: ${person} — ${change.after?.title ?? change.before?.title ?? "staff role"}.`;
}

function normalizeBullets(body: string): string {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletLines = lines.filter((line) => line.startsWith("➤")).slice(0, 5);
  return bulletLines.length > 0 ? bulletLines.join("\n") : body.trim();
}
