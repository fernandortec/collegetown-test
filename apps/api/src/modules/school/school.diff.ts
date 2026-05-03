import type { Change, ChangeType, StaffRecord } from "./school.types";

type IndexedRecord = StaffRecord & { index: number };

type Match = {
  current: IndexedRecord;
  archived: IndexedRecord;
};

const seniorityTerms = [
  { term: "athletic director", score: 45 },
  { term: "director of athletics", score: 45 },
  { term: "head coach", score: 40 },
  { term: "head ", score: 26 },
  { term: "associate ad", score: 34 },
  { term: "associate athletic director", score: 34 },
  { term: "assistant athletic director", score: 28 },
  { term: "senior", score: 26 },
  { term: "deputy", score: 34 },
  { term: "coordinator", score: 20 },
  { term: "director", score: 30 },
  { term: "chief", score: 35 },
];

const changeTypeWeights: Record<ChangeType, number> = {
  added: 38,
  removed: 34,
  title_changed: 30,
  contact_changed: 10,
};

export function buildStaffDiff(
  archivedStaff: StaffRecord[],
  currentStaff: StaffRecord[],
): { changes: Change[]; topChanges: Change[] } {
  const archived = archivedStaff.map((record, index) => ({ ...record, index }));
  const current = currentStaff.map((record, index) => ({ ...record, index }));
  const matches = matchRecords(archived, current);
  const matchedArchived = new Set(matches.map((match) => match.archived.index));
  const matchedCurrent = new Set(matches.map((match) => match.current.index));
  const changes: Change[] = [];

  for (const match of matches) {
    const titleChanged = normalizeText(match.archived.title) !== normalizeText(match.current.title);
    const contactChanged =
      normalizeContact(match.archived.email) !== normalizeContact(match.current.email) ||
      normalizeContact(match.archived.phone) !== normalizeContact(match.current.phone);

    if (titleChanged) {
      changes.push(createChange("title_changed", match.current, match.archived));
    }

    if (contactChanged) {
      changes.push(createChange("contact_changed", match.current, match.archived));
    }
  }

  for (const record of current) {
    if (!matchedCurrent.has(record.index)) {
      changes.push(createChange("added", record));
    }
  }

  for (const record of archived) {
    if (!matchedArchived.has(record.index)) {
      changes.push(createChange("removed", record, record));
    }
  }

  const ranked = changes.sort((left, right) => {
    if (right.importanceScore !== left.importanceScore) {
      return right.importanceScore - left.importanceScore;
    }
    return left.staffIdentity.localeCompare(right.staffIdentity);
  });

  return {
    changes: ranked,
    topChanges: ranked.slice(0, Math.min(8, Math.max(5, ranked.length))),
  };
}

function matchRecords(archived: IndexedRecord[], current: IndexedRecord[]): Match[] {
  const matches: Match[] = [];
  const unmatchedArchived = new Set(archived.map((record) => record.index));
  const unmatchedCurrent = new Set(current.map((record) => record.index));
  const archivedByName = new Map<string, IndexedRecord>();

  for (const record of archived) {
    const key = normalizeName(record.name);
    if (!archivedByName.has(key)) archivedByName.set(key, record);
  }

  for (const record of current) {
    const match = archivedByName.get(normalizeName(record.name));
    if (match && unmatchedArchived.has(match.index)) {
      matches.push({ current: record, archived: match });
      unmatchedCurrent.delete(record.index);
      unmatchedArchived.delete(match.index);
    }
  }

  for (const currentIndex of [...unmatchedCurrent]) {
    const currentRecord = current.find((record) => record.index === currentIndex);
    if (!currentRecord) continue;

    const candidates = archived.filter((record) => unmatchedArchived.has(record.index));
    const match = findConservativeFuzzyMatch(currentRecord, candidates);
    if (match) {
      matches.push({ current: currentRecord, archived: match });
      unmatchedCurrent.delete(currentRecord.index);
      unmatchedArchived.delete(match.index);
    }
  }

  return matches;
}

function findConservativeFuzzyMatch(
  current: IndexedRecord,
  candidates: IndexedRecord[],
): IndexedRecord | undefined {
  const currentParts = splitName(current.name);
  if (!currentParts.last) return undefined;

  const safeCandidates = candidates.filter((candidate) => {
    const candidateParts = splitName(candidate.name);
    if (!candidateParts.last || candidateParts.last !== currentParts.last) return false;
    if (candidateParts.first === currentParts.first) return true;
    if (candidateParts.first[0] && candidateParts.first[0] === currentParts.first[0]) {
      return titlesRelated(candidate.title, current.title);
    }
    return levenshtein(candidateParts.first, currentParts.first) <= 1 && titlesRelated(candidate.title, current.title);
  });

  return safeCandidates.length === 1 ? safeCandidates[0] : undefined;
}

function createChange(type: ChangeType, current: StaffRecord, archived?: StaffRecord): Change {
  const after = type === "removed" ? undefined : current;
  const before = type === "added" ? undefined : archived;
  const staffIdentity = current.name || archived?.name || "Unknown staff";
  const importanceScore = scoreChange(type, current, archived);

  return {
    type,
    staffIdentity,
    before,
    after,
    importanceScore,
    explanation: explainChange(type, current, archived),
  };
}

function scoreChange(type: ChangeType, current: StaffRecord, archived?: StaffRecord): number {
  const title = [current.title, archived?.title].filter(Boolean).join(" ");
  return changeTypeWeights[type] + scoreTitle(title);
}

function scoreTitle(title: string): number {
  const normalized = normalizeText(title);

  if (normalized.includes("assistant athletic director")) return 28;
  if (normalized.includes("associate athletic director") || normalized.includes("associate ad")) return 34;
  if (normalized.includes("director of athletics")) return 45;
  if (normalized.includes("athletic director")) return 45;

  return seniorityTerms.reduce((score, item) => {
    return normalized.includes(item.term) ? Math.max(score, item.score) : score;
  }, 0);
}

function explainChange(type: ChangeType, current: StaffRecord, archived: StaffRecord | undefined): string {
  const role = current.title || archived?.title || "role";
  const senior = scoreTitle(role) >= 30 ? " Senior staff role raises priority." : "";

  if (type === "added") return `${current.name} appears in current staff as ${role}.${senior}`;
  if (type === "removed") return `${current.name} appeared in archived staff as ${role} but is absent now.${senior}`;
  if (type === "title_changed") return `${current.name} title changed from ${archived?.title ?? "unknown"} to ${current.title}.${senior}`;
  return `${current.name} contact details changed. Contact-only changes rank lower unless role is senior.${senior}`;
}

function normalizeName(name: string): string {
  return normalizeText(name)
    .replace(/\b(jr|sr|ii|iii|iv|phd|edd|md)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitName(name: string): { first: string; last: string } {
  const parts = normalizeName(name).split(" ").filter(Boolean);
  return { first: parts[0] ?? "", last: parts.at(-1) ?? "" };
}

function normalizeText(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeContact(value: string | undefined): string {
  return normalizeText(value).replace(/\s+/g, "");
}

function titlesRelated(left: string, right: string): boolean {
  const leftTokens = new Set(normalizeText(left).split(" ").filter((token) => token.length > 3));
  const rightTokens = normalizeText(right).split(" ").filter((token) => token.length > 3);
  return rightTokens.some((token) => leftTokens.has(token));
}

function levenshtein(left: string, right: string): number {
  const matrix = Array.from({ length: left.length + 1 }, (_, index) => [index]);
  for (let index = 0; index <= right.length; index += 1) matrix[0][index] = index;

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
  }

  return matrix[left.length][right.length];
}
