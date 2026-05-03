import { Link, useParams } from "react-router-dom";
import { SourceCard } from "../features/schools/components/SourceCard";
import {
  useSchoolDiffQuery,
  useSchoolsQuery,
} from "../features/schools/queries";
import type {
  Change,
  DiffReport,
  StaffRecord,
} from "../features/schools/schemas";
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
      <div className="rounded-3xl border border-white/70 bg-white/55 p-6  backdrop-blur">
        <p className="text-sm font-bold uppercase text-[#2f756c]">
          Extracting staff
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          Live extraction running.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#526d68]">
          Backend renders both sources with Playwright, cleans page text, and
          detects differences
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
      <div className="flex min-w-0 flex-col gap-5 rounded-2xl p-5  md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 md:max-w-2xl">
          <p className="text-base font-bold uppercase text-[#2f756c]">
            Staff intelligence report
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] ">
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

      <hr className="h-0.5 text-[#2f756c]/10" />

      <section className="mt-12 min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#2f756c]">
              Top changes
            </p>
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

function ChangeTable({
  changes,
  dense = false,
}: {
  changes: Change[];
  dense?: boolean;
}) {
  return (
    <div className="mt-4 space-y-5">
      {changes.map((change) => (
        <article
          key={`${change.type}-${change.staffIdentity}`}
          className="overflow-hidden rounded-[1.75rem]  bg-white/75 shadow-lg shadow-[#9bb8b2]/20 backdrop-blur"
        >
          <div className="border-b border-[#d8e8e4] bg-white/60 px-5 py-5">
            <div className="flex min-w-0 items-center justify-between gap-4">
              <h4 className="min-w-0 truncate text-xl font-semibold tracking-[-0.03em] text-[#14312f]">
                {change.staffIdentity}
              </h4>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] ${getChangeBadgeClasses(change.type)}`}
              >
                {formatChangeType(change.type)}
              </span>
            </div>
            {!dense ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#526d68]">
                {change.explanation}
              </p>
            ) : null}
          </div>

          <div className="grid items-stretch gap-4 bg-white/45 p-4 lg:grid-cols-[1fr_auto_1fr]">
            <DiffRecord
              label="Prior state"
              record={change.before}
              emptyText="Not listed in archived snapshot"
              tone="removed"
            />
            <div className="hidden items-center lg:flex">
              <span className="grid size-10 place-items-center rounded-full  text-lg font-bold text-[#526d68] ">
                →
              </span>
            </div>
            <DiffRecord
              label="Current state"
              record={change.after}
              emptyText="Not listed in current directory"
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
  record,
  emptyText,
  tone,
}: {
  label: string;
  record?: StaffRecord;
  emptyText: string;
  tone: "added" | "removed";
}) {
  const panelClasses =
    tone === "added"
      ? "border-[#9bb8b2]/50 bg-[#e8f6f2]/85"
      : "border-[#d8e8e4] bg-white/85";
  const labelClasses = tone === "added" ? "text-[#2f756c]" : "text-[#526d68]";
  return (
    <div className={`min-w-0 rounded-2xl border ${panelClasses} p-5`}>
      <p className={`text-sm font-semibold uppercase  ${labelClasses}`}>
        {label}
      </p>
      {record ? (
        <div className="mt-4 space-y-3">
          {getRecordFields(record).map((field) => (
            <div
              key={field.label}
              className="grid gap-2 rounded-xl border border-white/80 bg-white/70 p-3 text-sm sm:grid-cols-[8rem_1fr]"
            >
              <p className="font-bold text-[#526d68]">{field.label}</p>
              <p className="min-w-0 break-words font-semibold text-[#14312f]">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[#9bb8b2]/60 bg-white/45 px-6 py-8 text-center">
          <p className="max-w-xs text-sm font-semibold leading-6 text-[#526d68]">
            {emptyText}
          </p>
        </div>
      )}
    </div>
  );
}

function getRecordFields(record: StaffRecord) {
  return [
    { label: "Designation", value: record.title || "Unknown title" },
    {
      label: "Direct contact",
      value:
        [record.email, record.phone].filter(Boolean).join(" · ") ||
        "No direct contact listed",
    },
    { label: "Directory name", value: record.name },
  ];
}

function getChangeBadgeClasses(type: Change["type"]) {
  if (type === "added") return "border-[#2f756c]/15 bg-[#dff4ef] text-[#2f756c]";
  if (type === "removed") return "border-[#e8b4a8] bg-[#fff4f1] text-[#8a3b2f]";
  if (type === "title_changed") return "border-[#9bb8b2]/50 bg-white/70 text-[#2f756c]";
  return "border-[#c8e6e0] bg-[#f1f8f6] text-[#526d68]";
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
