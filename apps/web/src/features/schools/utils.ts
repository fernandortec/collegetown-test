import type { School, SchoolSnapshot } from "./schemas";

export function getDefaultSnapshot(school: School): SchoolSnapshot | undefined {
  return (
    school.snapshots.find((snapshot) => snapshot.id === school.defaultSnapshotId) ??
    school.snapshots[0]
  );
}

export function withAlpha(hex: string, alpha: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(`Expected 6-digit hex color with # prefix, received '${hex}'.`);
  }

  if (!/^[0-9a-f]{2}$/i.test(alpha)) {
    throw new Error(`Expected 2-digit hex alpha, received '${alpha}'.`);
  }

  return `${hex}${alpha}`;
}
