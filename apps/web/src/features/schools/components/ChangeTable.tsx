import {
  getChangeBadgeClasses,
  formatChangeType,
  getRecordFields,
} from "../pages/SchoolPage/utils";
import { Change, StaffRecord } from "../schemas";

export function ChangeTable({
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
              <h4 className="min-w-0 truncate text-xl font-semibold tracking-tight text-[#14312f]">
                {change.staffIdentity}
              </h4>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-[0.68rem] font-black uppercase tracking-wide ${getChangeBadgeClasses(change.type)}`}
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
              <p className="min-w-0 wrap-break-word font-semibold text-[#14312f]">
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
