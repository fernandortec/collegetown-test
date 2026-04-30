import { Link } from "react-router-dom";
import { formatApiError } from "../../services/api";
import { StatusShell } from "./StatusShell";

interface CatalogErrorPageProps {
  error: unknown;
}
export function CatalogErrorPage({ error }: CatalogErrorPageProps) {
  return (
    <StatusShell eyebrow="API error" title="School catalog did not load.">
      <p className="mt-5 max-w-2xl rounded-2xl border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-100">
        {formatApiError(error)}
      </p>
      <Link
        className="mt-6 inline-flex rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-white hover:bg-red-500"
        to="/"
      >
        Return home
      </Link>
    </StatusShell>
  );
}
