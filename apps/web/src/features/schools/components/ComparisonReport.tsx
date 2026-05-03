import {
  RailMetric,
  MetricCard,
} from "../pages/SchoolPage/components/SchoolPageUI";
import { useEmailDraftQuery, useSchoolDiffQuery } from "../queries";
import { DiffReport, EmailDraft } from "../schemas";
import { ChangeTable } from "./ChangeTable";
import { RefreshButton } from "./RefreshButton";

export function ComparisonReport({
  query,
  onRefresh,
}: {
  query: ReturnType<typeof useSchoolDiffQuery>;
  onRefresh: () => Promise<void>;
}) {
  if (query.isPending || query.isFetching) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/55 p-6  backdrop-blur">
        <p>Extracting page contents</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Fetching staff
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
      <div className="relative rounded-3xl border border-[#e8b4a8] bg-[#fff4f1]/80 p-6 pr-20">
        <p className="text-sm font-bold uppercase tracking-wide text-[#8a3b2f]">
          Diff load failed
        </p>
        <p className="mt-4 font-mono text-sm text-[#8a3b2f]">
          {query.error.message}
        </p>
        {!query.isFetching && (
          <RefreshButton
            className="absolute  right-5 top-5 border-[#e8b4a8] bg-white/80 text-[#8a3b2f] hover:bg-white"
            onRefresh={onRefresh}
          />
        )}
      </div>
    );
  }

  return (
    <ReportSuccess
      report={query.data}
      isRefreshing={query.isFetching}
      onRefresh={onRefresh}
    />
  );
}

function ReportSuccess({
  report,
  isRefreshing,
  onRefresh,
}: {
  report: DiffReport;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}) {
  const emailDraftQuery = useEmailDraftQuery(report);

  return (
    <div className="relative min-w-0 lg:flow-root">
      <aside className="hidden lg:float-right lg:mb-8 lg:ml-8 lg:block lg:w-[28rem]">
        <div className="sticky top-6 rounded-4xl border border-white/70 bg-white/75 p-7 shadow-xl shadow-[#9bb8b2]/25 backdrop-blur">
          <p className="text-sm font-black uppercase tracking-wide text-[#2f756c]">
            Summary rail
          </p>
          <h3 className="mt-4 text-4xl font-semibold tracking-tight text-[#14312f]">
            {report.school.shortName}
          </h3>
          <p className="mt-3 text-base leading-7 text-[#526d68]">
            Snapshot: {report.sources.snapshotLabel}
          </p>
          <div className="mt-6 space-y-3">
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
          <EmailDraftRail query={emailDraftQuery} />
        </div>
      </aside>

      <section className="min-w-0">
        <div className="relative flex min-w-0 flex-col gap-5 rounded-2xl p-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 md:max-w-2xl">
            <p className="text-base font-bold uppercase text-[#2f756c]">
              Staff intelligence report
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight ">
              Top staff changes ranked by role impact.
            </h2>
            <p className="mt-3 text-base text-[#526d68]">
              Generated at {new Date(report.generatedAt).toLocaleString()}.
            </p>
            {!isRefreshing && (
              <RefreshButton
                className="absolute right-0 top-0"
                onRefresh={onRefresh}
              />
            )}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 md:min-w-[24rem]">
            <MetricCard label="Current" value={report.stats.currentCount} />
            <MetricCard label="Archived" value={report.stats.archivedCount} />
            <MetricCard label="Changes" value={report.stats.totalChanges} />
          </div>
        </div>

        <hr className="h-0.5 text-[#2f756c]/10" />
      </section>

      <section className="mt-8 min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-wide text-[#2f756c]">
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

function EmailDraftRail({
  query,
}: {
  query: ReturnType<typeof useEmailDraftQuery>;
}) {
  if (query.isPending || query.isFetching) {
    return (
      <div className="mt-5 rounded-2xl border border-white/70 bg-white/55 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-[#2f756c]">
          Email draft
        </p>
        <p className="mt-3 text-sm font-semibold text-[#526d68]">
          Generating email draft from top changes...
        </p>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mt-5 rounded-2xl border border-[#e8b4a8] bg-[#fff4f1]/80 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-[#8a3b2f]">
          Draft failed
        </p>
        <p className="mt-2 text-xs text-[#8a3b2f]">{query.error.message}</p>
      </div>
    );
  }

  const draft = query.data;

  return (
    <div className="mt-5 rounded-2xl border border-white/70 bg-white/55 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-wide text-[#2f756c]">
          Email draft
        </p>
        {draft.fallback && (
          <span className="rounded-full bg-[#f3d6a2] px-2 py-1 text-[0.62rem] font-black uppercase text-[#6f4b08]">
            Auto draft
          </span>
        )}
      </div>
      <h4 className="mt-3 text-base font-semibold text-[#14312f]">
        {draft.subject}
      </h4>
      <p className="mt-2 text-sm leading-5 text-[#526d68]">{draft.summary}</p>
      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-[#14312f]">
        {draft.body}
      </pre>
      <a
        className="mt-4 inline-flex w-full justify-center rounded-full bg-[#2f756c] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#245a54]"
        href={buildMailtoHref(draft)}
      >
        Open email draft
      </a>
    </div>
  );
}

function buildMailtoHref(draft: EmailDraft): string {
  const body = `${draft.summary}\n\n${draft.body}`;
  return `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(body)}`;
}
