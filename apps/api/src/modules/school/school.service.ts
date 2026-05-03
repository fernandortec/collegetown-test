import { schools } from "./school.catalog";
import type {
  ChangeType,
  DiffReport,
  PublicSchool,
  School,
  SchoolSnapshot,
  StaffRecord,
} from "./school.types";
import type { ExtractionSource } from "./school.extraction";
import { buildStaffDiff } from "./school.diff";

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
  const { changes, topChanges } = buildStaffDiff(archivedStaff, currentStaff);
  const countChanges = (type: ChangeType) =>
    changes.filter((change) => change.type === type).length;

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
    changes,
    topChanges,
    stats: {
      currentCount: currentStaff.length,
      archivedCount: archivedStaff.length,
      addedCount: countChanges("added"),
      removedCount: countChanges("removed"),
      titleChangedCount: countChanges("title_changed"),
      contactChangedCount: countChanges("contact_changed"),
      totalChanges: changes.length,
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
