import { StatusShell } from "./StatusShell";

export function CatalogLoadingPage() {
  return (
    <StatusShell eyebrow="Loading catalog" title="Fetching school metadata...">
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Georgia", "Virginia Tech", "Wittenberg"].map((name) => (
          <div
            className="h-80 animate-pulse rounded-[2rem] border border-white/70 bg-white/50 p-6 shadow-lg shadow-[#9bb8b2]/10 backdrop-blur"
            key={name}
          >
            <div className="h-4 w-24 rounded-full bg-[#dff4ef]" />
            <div className="mt-24 h-10 w-3/4 rounded-full bg-[#c8e6e0]" />
            <div className="mt-4 h-4 w-1/2 rounded-full bg-[#dff4ef]" />
          </div>
        ))}
      </div>
    </StatusShell>
  );
}
