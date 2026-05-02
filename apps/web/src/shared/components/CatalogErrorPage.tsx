import { Link } from "react-router-dom";
import { formatApiError } from "../../services/api";
import { StatusShell } from "./StatusShell";

interface CatalogErrorPageProps {
  error: unknown;
}
export function CatalogErrorPage({ error }: CatalogErrorPageProps) {
  return (
    <StatusShell eyebrow="API error" title="School catalog did not load.">
      <p className="mt-5 max-w-2xl rounded-2xl border border-[#e8b4a8] bg-[#fff4f1]/80 p-4 font-mono text-sm text-[#8a3b2f]">
        {formatApiError(error)}
      </p>
      <Link
        className="mt-6 inline-flex rounded-2xl bg-[#14312f] px-5 py-3 text-sm font-bold text-white hover:bg-[#2f756c]"
        to="/"
      >
        Return home
      </Link>
    </StatusShell>
  );
}
