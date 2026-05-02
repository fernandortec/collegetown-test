import { schools } from "./school.catalog";
import type {
  DiffReport,
  School,
  SchoolSnapshot,
  StaffRecord,
} from "./school.types";

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

const mockStaffBySchool: Record<
  School["id"],
  { currentStaff: StaffRecord[]; archivedStaff: StaffRecord[] }
> = {
  georgia: {
    currentStaff: [
      {
        name: "Josh Brooks",
        title: "J. Reid Parker Director of Athletics",
        phone: "706-542-9036",
        email: "jbrooks@sports.uga.edu",
      },
      {
        name: "Will Lawler",
        title: "Deputy Athletic Director, Development",
        email: "wlawler@sports.uga.edu",
      },
      {
        name: "Stephanie Ransom",
        title: "Executive Associate Athletic Director, Compliance",
      },
    ],
    archivedStaff: [
      {
        name: "Josh Brooks",
        title: "J. Reid Parker Director of Athletics",
        phone: "706-542-9036",
        email: "jbrooks@sports.uga.edu",
      },
      {
        name: "Matt Borman",
        title: "Deputy Athletic Director, Development",
      },
      {
        name: "Glada Horvat",
        title: "Executive Associate Athletic Director, Compliance",
      },
    ],
  },
  "virginia-tech": {
    currentStaff: [
      {
        name: "Whit Babcock",
        title: "Director of Athletics",
        phone: "540-231-3977",
      },
      {
        name: "Desiree Reed-Francois",
        title: "Executive Deputy Athletics Director",
      },
      {
        name: "Derek Gwinn",
        title: "Senior Associate Athletics Director, External Operations",
      },
    ],
    archivedStaff: [
      {
        name: "Whit Babcock",
        title: "Director of Athletics",
        phone: "540-231-3977",
      },
      {
        name: "Rhonda Arsenault",
        title: "Senior Associate Athletics Director, Administration",
      },
      {
        name: "Chris Helms",
        title: "Senior Associate Athletics Director, External Operations",
      },
    ],
  },
  wittenberg: {
    currentStaff: [
      {
        name: "Brian Agler",
        title: "Vice President and Director of Athletics and Recreation",
        email: "aglerb@wittenberg.edu",
      },
      {
        name: "Kati Wilson",
        title: "Associate Director of Athletics",
      },
      {
        name: "Tyler Hall",
        title: "Assistant Athletic Director, Communications",
      },
    ],
    archivedStaff: [
      {
        name: "Gary Williams",
        title: "Vice President and Director of Athletics and Recreation",
      },
      {
        name: "Kati Wilson",
        title: "Associate Director of Athletics",
      },
      {
        name: "Ryan Maurer",
        title: "Sports Information Director",
      },
    ],
  },
};

export function buildMockDiffReport(school: School): DiffReport {
  const snapshot = getDefaultSnapshot(school);
  const staff = mockStaffBySchool[school.id];

  return {
    school,
    sources: {
      currentUrl: school.currentUrl,
      archivedUrl: snapshot.url,
      snapshotId: snapshot.id,
      snapshotLabel: snapshot.label,
    },
    generatedAt: new Date().toISOString(),
    currentStaff: staff.currentStaff,
    archivedStaff: staff.archivedStaff,
    stats: {
      currentCount: staff.currentStaff.length,
      archivedCount: staff.archivedStaff.length,
    },
  };
}
