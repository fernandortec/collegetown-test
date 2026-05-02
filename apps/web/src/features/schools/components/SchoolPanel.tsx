import { Link } from "react-router-dom";
import type { School } from "../schemas";
import { getDefaultSnapshot, withAlpha } from "../utils";

export function SchoolPanel({ school }: { school: School }) {
  const snapshot = getDefaultSnapshot(school);
  const href = `/schools/${school.id}`;
  const colors = school.colors;

  return (
    <article className="group relative flex min-h-[24rem] flex-col justify-between overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-lg shadow-[#9bb8b2]/15 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-xl hover:shadow-[#9bb8b2]/20">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }}
      />

      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#dff4ef] px-3 py-1 text-sm font-bold text-[#2f756c] ring-1 ring-[#2f756c]/10">
            {school.conference}
          </span>
          <span
            className="rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm"
            style={{ backgroundColor: withAlpha(colors.primary, "E6"), color: colors.text }}
          >
            {school.monogram}
          </span>
        </div>

        <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-[#14312f] md:text-4xl">
          {school.shortName}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#526d68]">
          Current staff directory monitored against {snapshot?.year ?? "a previous"} Wayback
          baseline.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-white/70 bg-white/50 p-4">
          <p
            className="text-xs font-bold uppercase tracking-[0.12em]"
            style={{ color: colors.primary }}
          >
            Default snapshot
          </p>
          <p className="mt-2 text-sm font-medium text-[#14312f]">
            {snapshot?.label}
          </p>
        </div>
        <Link
          className="inline-flex w-full items-center justify-between rounded-2xl bg-[#14312f] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#2f756c]"
          to={href}
        >
          Open school report
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
