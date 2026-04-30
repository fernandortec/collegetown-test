import type { School, SchoolSnapshot } from "./schemas";

export function getDefaultSnapshot(school: School): SchoolSnapshot | undefined {
  return (
    school.snapshots.find((snapshot) => snapshot.id === school.defaultSnapshotId) ??
    school.snapshots[0]
  );
}

export function withAlpha(hex: string, alpha: string): string {
  return `${hex}${alpha}`;
}
