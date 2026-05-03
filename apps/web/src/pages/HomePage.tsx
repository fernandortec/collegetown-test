import { SchoolPanel } from "../features/schools/components/SchoolPanel";
import { useSchoolsQuery } from "../features/schools/queries";
import { CatalogErrorPage } from "../shared/components/CatalogErrorPage";
import { CatalogLoadingPage } from "../shared/components/CatalogLoadingPage";

export function HomePage() {
  const schoolsQuery = useSchoolsQuery();

  if (schoolsQuery.isPending) {
    return <CatalogLoadingPage />;
  }

  if (schoolsQuery.isError) {
    return <CatalogErrorPage error={schoolsQuery.error} />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,#d9f2ee,transparent_24rem),linear-gradient(135deg,#f6fbfa,#eef2ff)] px-5 py-8 text-[#14312f] md:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col">
        <header className="rounded-[2rem] border border-white/70 bg-white/55 p-8 shadow-xl shadow-[#9bb8b2]/20 backdrop-blur md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2f756c]">
            Better VPing
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-7xl">
            All university information in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526d68]">
            Monitor current public staff directories against archived Wayback
            baselines with airy panels and precise scanability.
          </p>
        </header>

        <div className="grid flex-1 gap-5 py-6 md:grid-cols-3">
          {schoolsQuery.data.map((school) => (
            <SchoolPanel key={school.id} school={school} />
          ))}
        </div>
      </section>
    </main>
  );
}
