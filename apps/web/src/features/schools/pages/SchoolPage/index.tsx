import { Link, useParams } from "react-router-dom";
import { useSchoolDiffQuery, useSchoolsQuery } from "../../queries";
import { getDefaultSnapshot } from "../../utils";
import { CatalogErrorPage } from "../../../../shared/components/CatalogErrorPage";
import { CatalogLoadingPage } from "../../../../shared/components/CatalogLoadingPage";
import { NotFoundPage } from "../../../../pages/NotFoundPage";
import { SchoolPageHeader } from "./components/SchoolPageHeader";
import { PreviewStage } from "./components/PreviewStage";
import { ComparisonReport } from "../../components/ComparisonReport";

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
      <section className="mx-auto max-w-368">
        <Link
          className="inline-flex rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-bold text-[#14312f] shadow-sm backdrop-blur transition hover:text-[#2f756c]"
          to="/"
        >
          ← School hub
        </Link>

        <div className="mt-6 overflow-hidden rounded-4xl border border-white/70 bg-white/55 shadow-xl shadow-[#9bb8b2]/20 backdrop-blur">
          <SchoolPageHeader school={school} />

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
