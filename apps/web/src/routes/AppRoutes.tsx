import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SchoolPage } from "../pages/SchoolPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/schools/:schoolId" element={<SchoolRoute />} />
      <Route path="*" element={<UnknownRoute />} />
    </Routes>
  );
}

function HomeRoute() {
  return <HomePage />;
}

function SchoolRoute() {
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

function UnknownRoute() {
  const location = useLocation();
  return (
    <NotFoundPage
      eyebrow="Not found"
      title="This route does not exist."
      body={`Better VPing could not match '${location.pathname}' to a page.`}
    />
  );
}




















    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });