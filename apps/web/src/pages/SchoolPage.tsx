import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
      <section className="mx-auto max-w-[92rem]">
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

          <PreviewStage
            currentUrl={school.currentUrl}
            archivedUrl={snapshot?.url ?? school.currentUrl}
          />

          <div className="border-t border-white/70 bg-white/45 p-5 md:p-8">
            <ComparisonReport query={diffQuery} />
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewStage({
  currentUrl,
  archivedUrl,
}: {
  currentUrl: string;
  archivedUrl: string;
}) {
  const [activePreview, setActivePreview] = useState<"current" | "archived">(
    "current",
  );
  const activeIndex = activePreview === "current" ? 0 : 1;

  return (
    <section className="border-t border-white/70 bg-[#14312f]/[0.03] p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2f756c]">
            Source
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#14312f] md:text-3xl">
            Before and after preview
          </h2>
        </div>
        <div className="flex rounded-full border border-white/70 bg-white/60 p-1 shadow-sm backdrop-blur">
          <PreviewTab
            active={activePreview === "current"}
            label="Current"
            onClick={() => setActivePreview("current")}
          />
          <PreviewTab
            active={activePreview === "archived"}
            label="Archived"
            onClick={() => setActivePreview("archived")}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.35rem]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          <div className="w-full shrink-0">
            <PagePreview key={currentUrl} label="Current" url={currentUrl} />
          </div>
          <div className="w-full shrink-0">
            <PagePreview key={archivedUrl} label="Archived" url={archivedUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
        active
          ? "bg-[#14312f] text-white shadow-sm"
          : "text-[#526d68] hover:text-[#14312f]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PagePreview({ label, url }: { label: string; url: string }) {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [dismissedFallback, setDismissedFallback] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(id);
  }, []);

  const showFallback = timedOut && !loaded && !dismissedFallback;

  return (
    <article className="overflow-hidden rounded-[1.35rem]  border border-[#d8e8e4] bg-[#0f2422] shadow-xl shadow-[#9bb8b2]/90">
      <header className="flex items-center gap-3 border-b border-white/10 bg-[#14312f] px-4 py-3 text-white">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff6b5f]" />
          <span className="size-2.5 rounded-full bg-[#f6c85f]" />
          <span className="size-2.5 rounded-full bg-[#7bd88f]" />
        </div>
        <div className="min-w-0 flex-1 rounded-full bg-white/10 px-3 py-1.5">
          <p className="truncate font-mono text-[0.68rem] text-white/70">
            {url}
          </p>
        </div>
        <span className="hidden text-xs font-black uppercase  text-[#dff4ef] sm:block">
          {label}
        </span>
        <a
          className="inline-flex shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase  text-[#14312f] transition hover:bg-[#dff4ef]"
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          Open
        </a>
      </header>
      <div className="relative h-[42vh] min-h-[42rem] bg-white">
        {!loaded  && !showFallback && !dismissedFallback ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-[#14312f]/70">
            <div>
              <p className="text-sm font-black uppercase  text-[#2f756c]">
                Loading {label.toLowerCase()} preview
              </p>
            </div>
          </div>
        ) : null}
        <iframe
          className="h-full w-full bg-white"
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
          src={url}
          title={`${label} preview`}
        />
        {showFallback ? (
          <div className="absolute bottom-4 right-4 z-10 max-w-sm rounded-2xl border border-[#d8e8e4] bg-white/95 p-4 text-left shadow-2xl shadow-[#14312f]/20 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase text-[#8a3b2f]">
                  Preview blocked or slow
                </p>
                <p className="mt-2 text-sm leading-5 text-[#526d68]">
                  Source may block embedding. Report below still works.
                </p>
              </div>
              <button
                aria-label="Close preview warning"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-[#d8e8e4] text-sm font-black text-[#14312f] transition hover:border-[#2f756c] hover:text-[#2f756c]"
                onClick={() => setDismissedFallback(true)}
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
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
    <div className="grid min-w-0 gap-6 lg:grid-cols-[17rem_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-6 rounded-[1.5rem] border border-white/70 bg-white/70 p-5 shadow-lg shadow-[#9bb8b2]/20 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2f756c]">
            Summary rail
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#14312f]">
            {report.school.shortName}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#526d68]">
            Snapshot: {report.sources.snapshotLabel}
          </p>
          <div className="mt-5 space-y-2">
            <RailMetric
              label="Current staff"
              value={report.stats.currentCount}
            />
            <RailMetric
              label="Archived staff"
              value={report.stats.archivedCount}
            />
            <RailMetric
              label="Total changes"
              value={report.stats.totalChanges}
            />
            <RailMetric label="Added" value={report.stats.addedCount} />
            <RailMetric label="Removed" value={report.stats.removedCount} />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-col gap-5 rounded-2xl p-5 md:flex-row md:items-start md:justify-between">
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
  if (type === "added")
    return "border-[#2f756c]/15 bg-[#dff4ef] text-[#2f756c]";
  if (type === "removed") return "border-[#e8b4a8] bg-[#fff4f1] text-[#8a3b2f]";
  if (type === "title_changed")
    return "border-[#9bb8b2]/50 bg-white/70 text-[#2f756c]";
  return "border-[#c8e6e0] bg-[#f1f8f6] text-[#526d68]";
}

function formatChangeType(type: Change["type"]): string {
  if (type === "title_changed") return "Title changed";
  if (type === "contact_changed") return "Contact changed";
  return type[0].toUpperCase() + type.slice(1);
}

function RailMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/70 bg-white/60 px-3 py-2">
      <span className="text-xs font-bold uppercase tracking-wider text-[#526d68]">
        {label}
      </span>
      <span className="text-lg font-semibold text-[#14312f]">{value}</span>
    </div>
  );
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
