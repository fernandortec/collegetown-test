import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { SchoolRoute } from "../pages/SchoolPage";

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/schools/:schoolId" element={<SchoolRoute />} />
        <Route path="*" element={<UnknownRoute />} />
      </Routes>
    </>
  );
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

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [location.pathname]);

  return null;
}
