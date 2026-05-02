import {
  extractStaffRecordsFromPage,
  withStaffExtractionBrowser,
} from "./school.extraction";
import { schools } from "./school.catalog";
import type { DiffReport, School, SchoolSnapshot } from "./school.types";

export function listSchools(): School[] {
  return schools;
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

export async function buildDiffReport(school: School): Promise<DiffReport> {
  const snapshot = getDefaultSnapshot(school);

  return withStaffExtractionBrowser(async (browser) => {
    const currentStaff = await extractStaffRecordsFromPage({
      browser,
      schoolId: school.id,
      source: "current",
      url: school.currentUrl,
    });

    const archivedStaff = await extractStaffRecordsFromPage({
      browser,
      schoolId: school.id,
      source: "archive",
      url: snapshot.url,
    });

    return {
      school,
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
  });
}
