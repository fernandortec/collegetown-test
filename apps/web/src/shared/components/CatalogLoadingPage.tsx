import { useSchoolsQuery } from "../../features/schools/queries";
import { StatusShell } from "./StatusShell";

export function CatalogLoadingPage() {
  const schools = useSchoolsQuery()
  return (
    <StatusShell eyebrow="Loading catalog" title="Fetching school metadata...">
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {schools.data?.map((school) => (
          <div
            className="h-80 animate-pulse rounded-4xl border border-white/70 bg-white/50 p-6 shadow-lg shadow-[#9bb8b2]/10 backdrop-blur"
            key={school.id}
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
