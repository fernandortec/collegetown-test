import { Link } from "react-router-dom";
import { SourceCard } from "../features/schools/components/SourceCard";
import { useSchoolsQuery } from "../features/schools/queries";
import { getDefaultSnapshot, withAlpha } from "../features/schools/utils";
import { CatalogErrorPage } from "../shared/components/CatalogErrorPage";
import { CatalogLoadingPage } from "../shared/components/CatalogLoadingPage";
import { NotFoundPage } from "./NotFoundPage";

interface SchoolPageProps {
  schoolId: string;
}

export function SchoolPage({ schoolId }: SchoolPageProps) {
  const schoolsQuery = useSchoolsQuery();

  if (schoolsQuery.isPending) return <CatalogLoadingPage />;
  if (schoolsQuery.isError) {
    return <CatalogErrorPage error={schoolsQuery.error} />;
  }

  const school = schoolsQuery.data.find((item) => item.id === schoolId);

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
    <main className="min-h-screen bg-[#0d0507] px-5 py-6 text-white md:px-8">
      <section className="mx-auto max-w-6xl">
        <Link
          className="inline-flex rounded-full border border-red-800/60 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-red-200 transition hover:border-red-500 hover:text-white"
          to="/"
        >
          ← School hub
        </Link>

        <div
          className="mt-6 overflow-hidden rounded-[2rem] border bg-neutral-950 shadow-2xl"
          style={{
            borderColor: withAlpha(school.colors.primary, "99"),
            boxShadow: `0 2rem 7rem ${withAlpha(school.colors.primary, "26")}`,
          }}
        >
          <div
            className="relative isolate overflow-hidden p-6 md:p-10"
            style={{
              background: `radial-gradient(circle at 78% 12%, ${withAlpha(
                school.colors.primary,
                "55",
              )}, transparent 32%), linear-gradient(135deg, rgba(0, 0, 0, 0.88), ${withAlpha(
                school.colors.secondary,
                "44",
              )})`,
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -right-5 top-2 -z-10 text-[8rem] font-black tracking-[-0.12em] opacity-15 md:text-[13rem]"
              style={{ color: school.colors.accent }}
            >
              {school.monogram}
            </div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-red-200">
              School route
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.06em] md:text-7xl">
              {school.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
              Phase 2 route is live. Phase 3 will auto-run scraping and diffing
              here; current page already has school metadata, default snapshot,
              source URLs, and accent colors.
            </p>
          </div>

          <div className="grid gap-4 border-t border-white/10 bg-black/30 p-5 md:grid-cols-2 md:p-8">
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

          <div className="border-t border-white/10 bg-neutral-950 p-5 md:p-8">
            <div className="rounded-3xl border border-dashed border-red-900/70 bg-red-950/20 p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-red-300">
                Comparison report
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300">
                Metadata route ready. Scrape, diff, previews, and email draft
                attach in later phases without changing this route shape.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
