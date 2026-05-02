import { Link, useParams } from "react-router-dom";
import { SourceCard } from "../features/schools/components/SourceCard";
import {
  useSchoolDiffQuery,
  useSchoolsQuery,
} from "../features/schools/queries";
import type { DiffReport, StaffRecord } from "../features/schools/schemas";
import { getDefaultSnapshot, withAlpha } from "../features/schools/utils";
import { CatalogErrorPage } from "../shared/components/CatalogErrorPage";
import { CatalogLoadingPage } from "../shared/components/CatalogLoadingPage";
import { NotFoundPage } from "./NotFoundPage";

interface SchoolPageProps {
  schoolId: string;
}

export function SchoolPage({ schoolId }: SchoolPageProps) {
  const schoolsQuery = useSchoolsQuery();
  const diffQuery = useSchoolDiffQuery(schoolId, schoolsQuery.isSuccess);

  if (schoolsQuery.isPending) return <CatalogLoadingPage />;
  if (schoolsQuery.isError) {
    return <CatalogErrorPage error={schoolsQuery.error} />;
  }

  const school = schoolsQuery.data.find((item) => item.id === schoolId);

  if (!school) {
    return (
      <NotFoundPage
        eyebrow="Unknown school"
        title="That school is not in this Better VPing catalog."
        body={`No school matches '${schoolId}'. Choose Georgia, Virginia Tech, or Wittenberg.`}
      />
    );
  }

  const snapshot = getDefaultSnapshot(school);

  return (
    <main className="min-h-screen bg-[#0d0507] px-5 py-6 text-white md:px-8">
      <section className="mx-auto max-w-6xl">
        <Link
          className="inline-flex rounded-full border border-red-800/60 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200 transition hover:border-red-500 hover:text-white"
          to="/"
        >
          ← School hub
        </Link>

        <div
          className="mt-6 overflow-hidden rounded-[2rem] border bg-neutral-950 shadow-2xl"
          style={{
            borderColor: withAlpha(school.colors.primary, "99"),
            boxShadow: `0 2rem 7rem ${withAlpha(school.colors.primary, "26")}`,
          }}
        >
          <div
            className="relative isolate overflow-hidden p-6 md:p-10"
            style={{
              background: `radial-gradient(circle at 78% 12%, ${withAlpha(
                school.colors.primary,
                "55",
              )}, transparent 32%), linear-gradient(135deg, rgba(0, 0, 0, 0.88), ${withAlpha(
                school.colors.secondary,
                "44",
              )})`,
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -right-5 top-2 -z-10 text-[8rem] font-black tracking-[-0.12em] opacity-15 md:text-[13rem]"
              style={{ color: school.colors.accent }}
            >
              {school.monogram}
            </div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-red-200">
              Phase 3 tracer bullet
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.06em] md:text-7xl">
              {school.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
              Page loads mocked current and archived staff directory diffs while
              diff engine gets rebuilt from scratch.
            </p>
          </div>

          <div className="grid gap-4 border-t border-white/10 bg-black/30 p-5 md:grid-cols-2 md:p-8">
            <SourceCard
              label="Current staff directory"
              title={school.shortName}
              url={school.currentUrl}
            />
            <SourceCard
              label="Default archived snapshot"
              title={snapshot?.label ?? "No default snapshot configured"}
              url={snapshot?.url ?? school.currentUrl}
            />
          </div>

          <div className="border-t border-white/10 bg-neutral-950 p-5 md:p-8">
            <ComparisonReport query={diffQuery} />
          </div>
        </div>
      </section>
    </main>
  );
}

function ComparisonReport({
  query,
}: {
  query: ReturnType<typeof useSchoolDiffQuery>;
}) {
  if (query.isPending) {
    return (
      <div className="rounded-3xl border border-red-900/70 bg-red-950/20 p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">
          Loading diff
        </p>
        <h2 className="mt-3 text-3xl font-black">
          Mock report loading.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
          Backend route returns deterministic mock staff records for current and
          archived sources.
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-red-400" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-3xl border border-red-500/50 bg-red-950/30 p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-200">
          Diff load failed
        </p>
        <p className="mt-4 font-mono text-sm text-red-50">
          {query.error.message}
        </p>
      </div>
    );
  }

  return <ReportSuccess report={query.data} />;
}

function ReportSuccess({ report }: { report: DiffReport }) {
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
            Mock diff loaded
          </p>
          <h2 className="mt-3 text-3xl font-black">
            Structured staff records returned.
          </h2>
          <p className="mt-2 text-sm text-neutral-300">
            Generated at {new Date(report.generatedAt).toLocaleString()}.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Current" value={report.stats.currentCount} />
          <MetricCard label="Archived" value={report.stats.archivedCount} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <StaffList
          label="Current staff"
          records={report.currentStaff}
          sourceUrl={report.sources.currentUrl}
        />
        <StaffList
          label="Archived staff"
          records={report.archivedStaff}
          sourceUrl={report.sources.archivedUrl}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-28 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
      <p className="text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">
        {label}
      </p>
    </div>
  );
}

function StaffList({
  label,
  records,
  sourceUrl,
}: {
  label: string;
  records: StaffRecord[];
  sourceUrl: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-neutral-950/70 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">
            {label}
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            {records.length} records
          </p>
        </div>
        <a
          className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300 underline decoration-red-500"
          href={sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Source
        </a>
      </div>

      <div className="mt-5 max-h-[34rem] space-y-3 overflow-auto pr-2">
        {records.map((record, index) => (
          <div
            key={`${record.name}-${index}`}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="font-black text-white">{record.name}</p>
            <p className="mt-1 text-sm text-neutral-300">{record.title}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-400">
              {record.email ? (
                <span className="rounded-full bg-white/5 px-3 py-1">
                  {record.email}
                </span>
              ) : null}
              {record.phone ? (
                <span className="rounded-full bg-white/5 px-3 py-1">
                  {record.phone}
                </span>
              ) : null}
              {!record.email && !record.phone ? (
                <span className="rounded-full bg-white/5 px-3 py-1">
                  No contact listed
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function SchoolRoute() {
  const { schoolId } = useParams<{ schoolId: string }>();
  if (!schoolId) {
    return (
      <NotFoundPage
        eyebrow="Unknown school"
        title="School route is missing an id."
        body="Use /schools/:schoolId to open a Better VPing school report."
      />
    );
  }

  return <SchoolPage schoolId={schoolId} />;
}
