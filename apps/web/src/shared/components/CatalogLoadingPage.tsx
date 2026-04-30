import { StatusShell } from "./StatusShell";

export function CatalogLoadingPage() {
  return (
    <StatusShell eyebrow="Loading catalog" title="Fetching school metadata...">
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Georgia", "Virginia Tech", "Wittenberg"].map((name) => (
          <div
            className="h-80 animate-pulse rounded-[2rem] border border-red-900/30 bg-red-950/15 p-6"
            key={name}
          >
            <div className="h-4 w-24 rounded-full bg-red-800/40" />
            <div className="mt-24 h-10 w-3/4 rounded-full bg-red-700/30" />
            <div className="mt-4 h-4 w-1/2 rounded-full bg-red-700/20" />
          </div>
        ))}
      </div>
    </StatusShell>
  );
}
