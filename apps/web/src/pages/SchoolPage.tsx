import { Link, useParams } from "react-router-dom";
import { SourceCard } from "../features/schools/components/SourceCard";
import {
  useSchoolDiffQuery,
  useSchoolsQuery,
} from "../features/schools/queries";
import type { Change, DiffReport, StaffRecord } from "../features/schools/schemas";
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
  const canLoadDiff = schoolsQuery.isSuccess && Boolean(school);
  const diffQuery = useSchoolDiffQuery(schoolId, canLoadDiff);

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
                style={{
                  backgroundColor: withAlpha(school.colors.primary, "E6"),
                }}
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
        <p className="text-sm font-bold uppercase text-[#2f756c]">
          Extracting staff
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          Live extraction running.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#526d68]">
          Backend renders both sources with Playwright, cleans …cleans page
          text, and detects differences..
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#c8e6e0]">
          <div className="h-full animate-load-progress rounded-full bg-[#2f756c]" />
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
    <div className="min-w-0">
      <div className="flex min-w-0 flex-col gap-5 rounded-2xl border border-white/70 bg-white/45 p-5 shadow-sm backdrop-blur md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 md:max-w-2xl">
          <p className="text-base font-bold uppercase text-[#2f756c]">
            Staff intelligence report
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] md:text-5xl">
            Top staff changes ranked by role impact.
          </h2>
          <p className="mt-3 text-base text-[#526d68]">
            Generated at {new Date(report.generatedAt).toLocaleString()}.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 md:min-w-[24rem]">
          <MetricCard label="Current" value={report.stats.currentCount} />
          <MetricCard label="Archived" value={report.stats.archivedCount} />
          <MetricCard label="Changes" value={report.stats.totalChanges} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <SmallMetric label="Added" value={report.stats.addedCount} />
        <SmallMetric label="Removed" value={report.stats.removedCount} />
        <SmallMetric label="Title" value={report.stats.titleChangedCount} />
        <SmallMetric label="Contact" value={report.stats.contactChangedCount} />
      </div>

      <section className="mt-6 min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#2f756c]">Top changes</p>
            <h3 className="text-lg font-semibold tracking-[-0.03em]">
              Most meaningful moves first.
            </h3>
          </div>
          <p className="text-xs font-semibold text-[#526d68]">
            Showing {report.topChanges.length} of {report.changes.length}
          </p>
        </div>
        <ChangeTable changes={report.topChanges} />
      </section>

      <details className="mt-4 rounded-xl border border-white/70 bg-white/55 p-3 shadow-sm backdrop-blur">
        <summary className="cursor-pointer text-xs font-bold uppercase text-[#2f756c]">
          All detected changes ({report.changes.length})
        </summary>
        <ChangeTable changes={report.changes} dense />
      </details>
    </div>
  );
}

function ChangeTable({ changes, dense = false }: { changes: Change[]; dense?: boolean }) {
  return (
    <div className="mt-3 space-y-2">
      {changes.map((change) => (
        <article
          key={`${change.type}-${change.staffIdentity}`}
          className="overflow-hidden rounded-xl border border-[#d8e8e4] bg-white/70 shadow-sm shadow-[#9bb8b2]/20"
        >
          <div className="flex flex-col gap-1.5 border-b border-[#e3eeeb] bg-[#f1f8f6] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#2f756c]/15 bg-[#dff4ef] px-2 py-0.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#2f756c]">
                  {formatChangeType(change.type)}
                </span>
                <span className="font-mono text-[0.68rem] font-semibold text-[#526d68]">
                  score {change.importanceScore}
                </span>
              </div>
              <h4 className="mt-1 truncate text-sm font-semibold text-[#14312f]">
                {change.staffIdentity}
              </h4>
            </div>
            {!dense ? (
              <p className="max-w-xl text-[0.68rem] leading-4 text-[#526d68]">
                {change.explanation}
              </p>
            ) : null}
          </div>

          <div className="grid min-w-0 gap-px bg-[#d8e8e4]">
            <DiffRecord
              label="Before"
              marker="-"
              record={change.before}
              emptyText="Not listed before"
              tone="removed"
            />
            <DiffRecord
              label="After"
              marker="+"
              record={change.after}
              emptyText="Not listed after"
              tone="added"
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function DiffRecord({
  label,
  marker,
  record,
  emptyText,
  tone,
}: {
  label: string;
  marker: "+" | "-";
  record?: StaffRecord;
  emptyText: string;
  tone: "added" | "removed";
}) {
  const color = tone === "added" ? "text-[#2f756c]" : "text-[#8a3b2f]";
  const bg = tone === "added" ? "bg-[#e8f6f2]" : "bg-[#fff4f1]";
  const lines = record
    ? [record.name, record.title, [record.email, record.phone].filter(Boolean).join(" · ")].filter(Boolean)
    : [emptyText];

  return (
    <div className={`${bg} min-w-0 p-2.5 font-mono text-[0.68rem] leading-4`}>
      <p className="mb-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#526d68]">
        {label}
      </p>
      {lines.map((line) => (
        <p key={line} className={`${color} flex min-w-0 gap-2 whitespace-pre-wrap break-words`}>
          <span className="select-none text-[#8aa09c]">{marker}</span>
          <span>{line}</span>
        </p>
      ))}
    </div>
  );
}

function formatChangeType(type: Change["type"]): string {
  if (type === "title_changed") return "Title changed";
  if (type === "contact_changed") return "Contact changed";
  return type[0].toUpperCase() + type.slice(1);
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/70 bg-white/55 p-4 text-center shadow-sm backdrop-blur">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-0.5 truncate text-[0.68rem] font-bold uppercase tracking-widest text-[#2f756c]">
        {label}
      </p>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-0 items-center justify-between rounded-xl border border-white/70 bg-white/45 px-3 py-2 shadow-sm backdrop-blur">
      <p className="truncate text-[0.68rem] font-black uppercase tracking-widest text-[#2f756c]">
        {label}
      </p>
      <p className="text-lg font-semibold text-[#14312f]">{value}</p>
    </div>
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
