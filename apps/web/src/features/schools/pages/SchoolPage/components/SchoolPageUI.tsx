export function RailMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/65 px-4 py-3">
      <span className="text-sm font-bold uppercase tracking-wide text-[#526d68]">
        {label}
      </span>
      <span className="text-2xl font-semibold text-[#14312f]">{value}</span>
    </div>
  );
}

export function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/70 bg-white/55 p-4 text-center shadow-sm backdrop-blur">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-0.5 truncate text-[0.68rem] font-bold uppercase tracking-wide text-[#2f756c]">
        {label}
      </p>
    </div>
  );
}
