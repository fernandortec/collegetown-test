import { SchoolPanel } from "../features/schools/components/SchoolPanel";
import { useSchoolsQuery } from "../features/schools/queries";
import { CatalogErrorPage } from "../shared/components/CatalogErrorPage";
import { CatalogLoadingPage } from "../shared/components/CatalogLoadingPage";

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const schoolsQuery = useSchoolsQuery();

  if (schoolsQuery.isPending) {
    return <CatalogLoadingPage />;
  }

  if (schoolsQuery.isError) {
    return (
      <CatalogErrorPage error={schoolsQuery.error} onNavigate={onNavigate} />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#120508] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 md:px-8">
        <header className="flex flex-col gap-5 border-b border-red-900/40 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.45em] text-red-400">
              Better VPing
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] text-white md:text-7xl">
              Staff directory intelligence for three monitored programs.
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-red-100/70">
            Premium red/news-style monitoring hub. Metadata comes from the Hono
            API, with official color accents and CSS monograms only.
          </p>
        </header>

        <div className="grid flex-1 gap-4 py-6 md:grid-cols-3">
          {schoolsQuery.data.map((school) => (
            <SchoolPanel
              key={school.id}
              school={school}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
