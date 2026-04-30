import { Link } from "react-router-dom";
import type { School } from "../schemas";
import { getDefaultSnapshot, withAlpha } from "../utils";

export function SchoolPanel({ school }: { school: School }) {
  const snapshot = getDefaultSnapshot(school);
  const href = `/schools/${school.id}`;

  return (
    <article
      className="group relative isolate flex min-h-[28rem] overflow-hidden rounded-[2rem] border p-6 shadow-2xl transition duration-300 hover:-translate-y-1 md:min-h-0"
      style={{
        borderColor: withAlpha(school.colors.primary, "90"),
        background: `linear-gradient(145deg, ${withAlpha(
          school.colors.primary,
          "4D",
        )} 0%, rgba(10, 10, 10, 0.96) 46%, ${withAlpha(
          school.colors.secondary,
          "66",
        )} 100%)`,
        boxShadow: `0 2rem 6rem ${withAlpha(school.colors.primary, "30")}`,
        color: school.colors.text,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: school.colors.primary }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-7 top-8 -z-10 text-[9rem] font-black leading-none tracking-[-0.12em] opacity-20 blur-[1px] transition duration-300 group-hover:opacity-30 md:text-[10rem]"
        style={{ color: school.colors.accent }}
      >
        {school.monogram}
      </div>

      <div className="flex w-full flex-col justify-between gap-8">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white/85">
              {school.conference}
            </span>
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: school.colors.secondary }}
            />
          </div>
          <h2 className="mt-8 text-4xl font-black tracking-[-0.06em] md:text-5xl">
            {school.shortName}
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Current staff directory monitored against {snapshot?.year} Wayback
            baseline.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-xs text-white/70">
            <p className="font-bold uppercase tracking-[0.25em] text-white/45">
              Default snapshot
            </p>
            <p className="mt-2 text-sm text-white">{snapshot?.label}</p>
          </div>
          <Link
            className="inline-flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-neutral-950 transition hover:bg-red-100"
            to={href}
          >
            Open school report
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
