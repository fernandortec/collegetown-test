import { schools } from "./school.catalog";
import type {
  DiffReport,
  PublicSchool,
  School,
  SchoolSnapshot,
  StaffRecord,
} from "./school.types";
import type { ExtractionSource } from "./school.extraction";

export function listSchools(): School[] {
  return schools;
}

export function listPublicSchools(): PublicSchool[] {
  return schools.map(toPublicSchool);
}

export function getSchoolById(schoolId: string): School | undefined {
  return schools.find((school) => school.id === schoolId);
}

export function getDefaultSnapshot(school: School): SchoolSnapshot {
  const snapshot =
    school.snapshots.find(
      (candidate) => candidate.id === school.defaultSnapshotId,
    ) ?? school.snapshots[0];

  if (!snapshot) {
    throw new Error(`Missing default snapshot for ${school.id}.`);
  }

  return snapshot;
}

export async function buildDiffReport(
  school: School,
  extractor: (source: ExtractionSource, url: string) => Promise<StaffRecord[]>
): Promise<DiffReport> {
  const snapshot = getDefaultSnapshot(school);

  const currentStaff = await extractor("current", school.currentUrl);
  const archivedStaff = await extractor("archive", snapshot.url);

  return {
    school: toPublicSchool(school),
    sources: {
      currentUrl: school.currentUrl,
      archivedUrl: snapshot.url,
      snapshotId: snapshot.id,
      snapshotLabel: snapshot.label,
    },
    generatedAt: new Date().toISOString(),
    currentStaff,
    archivedStaff,
    stats: {
      currentCount: currentStaff.length,
      archivedCount: archivedStaff.length,
    },
  };
}

export function toPublicSchool(school: School): PublicSchool {
  return {
    id: school.id,
    name: school.name,
    shortName: school.shortName,
    conference: school.conference,
    monogram: school.monogram,
    colors: school.colors,
    currentUrl: school.currentUrl,
    defaultSnapshotId: school.defaultSnapshotId,
    snapshots: school.snapshots,
  };
}
