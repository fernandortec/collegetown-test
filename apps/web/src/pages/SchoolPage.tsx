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
  const school = schoolsQuery.data?.find((item) => item.id === schoolId);

  const diffQuery = useSchoolDiffQuery(
    schoolId,
    schoolsQuery.isSuccess && Boolean(school),
  );

  if (schoolsQuery.isPending) return <CatalogLoadingPage />;
  if (schoolsQuery.isError) {
    return <CatalogErrorPage error={schoolsQuery.error} />;
  }

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,#d9f2ee,transparent_24rem),linear-gradient(135deg,#f6fbfa,#eef2ff)] px-5 py-8 text-[#14312f] md:px-8">
      <section className="mx-auto max-w-6xl">
        <Link
          className="inline-flex rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-bold text-[#14312f] shadow-sm backdrop-blur transition hover:text-[#2f756c]"
          to="/"
        >
          ← School hub
        </Link>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 shadow-xl shadow-[#9bb8b2]/20 backdrop-blur">
          <div className="relative isolate overflow-hidden p-8 md:p-12">
            <div
              aria-hidden="true"
              className="absolute -right-8 top-4 -z-10 text-[8rem] font-semibold tracking-[-0.12em] opacity-10 md:text-[13rem]"
              style={{ color: school.colors.primary }}
            >
              {school.monogram}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="rounded-2xl px-3 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: withAlpha(school.colors.primary, "E6") }}
              >
                {school.monogram}
              </span>
              <span className="rounded-full bg-[#dff4ef] px-3 py-1 text-sm font-bold text-[#2f756c] ring-1 ring-[#2f756c]/10">
                {school.conference}
              </span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.045em] md:text-7xl">
              {school.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526d68]">
              Page runs live server-side extraction for current and archived
              staff directories, then shows raw structured records.
            </p>
          </div>

          <div className="grid gap-4 border-t border-white/70 bg-white/30 p-5 md:grid-cols-2 md:p-8">
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

          <div className="border-t border-white/70 bg-white/45 p-5 md:p-8">
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
      <div className="rounded-3xl border border-white/70 bg-white/55 p-6 shadow-lg shadow-[#9bb8b2]/10 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2f756c]">
          Extracting staff
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          Live extraction running.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#526d68]">
          Backend renders both sources with Playwright, cleans page text, and
          asks Gemini for structured staff records.
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#c8e6e0]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#2f756c]" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-3xl border border-[#e8b4a8] bg-[#fff4f1]/80 p-6">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#8a3b2f]">
          Diff load failed
        </p>
        <p className="mt-4 font-mono text-sm text-[#8a3b2f]">
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
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#2f756c]">
            Staff extracted
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Structured staff records returned.
          </h2>
          <p className="mt-2 text-sm text-[#526d68]">
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
    <div className="min-w-28 rounded-2xl border border-white/70 bg-white/55 p-4 text-center shadow-sm backdrop-blur">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#2f756c]">
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
    <article className="rounded-3xl border border-white/70 bg-white/55 p-5 shadow-lg shadow-[#9bb8b2]/10 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase  text-[#2f756c]">
            {label}
          </p>
          <p className="mt-1 text-sm text-[#526d68]">
            {records.length} records
          </p>
        </div>
        <Link
          className="text-sm font-bold text-[#14312f] underline decoration-[#2f756c] decoration-2 underline-offset-4 hover:text-[#2f756c]"
          to={sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          Source
        </Link>
      </div>

      <div className="mt-5 max-h-[34rem] space-y-3 overflow-auto pr-2">
        {records.map((record, index) => (
          <div
            key={`${record.name}-${index}`}
            className="rounded-2xl border border-white/70 bg-white/55 p-4"
          >
            <p className="font-semibold text-[#14312f]">{record.name}</p>
            <p className="mt-1 text-sm text-[#526d68]">{record.title}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#526d68]">
              {record.email ? (
                <span className="rounded-full bg-[#dff4ef] px-3 py-1">
                  {record.email}
                </span>
              ) : null}
              {record.phone ? (
                <span className="rounded-full bg-[#dff4ef] px-3 py-1">
                  {record.phone}
                </span>
              ) : null}
              {!record.email && !record.phone ? (
                <span className="rounded-full bg-[#dff4ef] px-3 py-1">
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
