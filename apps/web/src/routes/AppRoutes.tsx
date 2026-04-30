import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
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
  const onNavigate = useAppNavigate();

  return <HomePage onNavigate={onNavigate} />;
}

function SchoolRoute() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const onNavigate = useAppNavigate();

  if (!schoolId) {
    return (
      <NotFoundPage
        eyebrow="Unknown school"
        title="School route is missing an id."
        body="Use /schools/:schoolId to open a Better VPing school report."
        onNavigate={onNavigate}
      />
    );
  }

  return <SchoolPage schoolId={schoolId} onNavigate={onNavigate} />;
}

function UnknownRoute() {
  const location = useLocation();
  const onNavigate = useAppNavigate();

  return (
    <NotFoundPage
      eyebrow="Not found"
      title="This route does not exist."
      body={`Better VPing could not match '${location.pathname}' to a page.`}
      onNavigate={onNavigate}
    />
  );
}

function useAppNavigate() {
  const navigate = useNavigate();

  return (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}
