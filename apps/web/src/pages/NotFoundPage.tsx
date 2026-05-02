import { Link } from "react-router-dom";
import { StatusShell } from "../shared/components/StatusShell";

interface NotFoundPageProps {
  eyebrow: string;
  title: string;
  body: string;
}

export function NotFoundPage({ eyebrow, title, body }: NotFoundPageProps) {
  return (
    <StatusShell eyebrow={eyebrow} title={title}>
      <p className="mt-5 max-w-2xl text-[#526d68]">{body}</p>
      <Link
        className="mt-6 inline-flex rounded-2xl bg-[#14312f] px-5 py-3 text-sm font-bold text-white hover:bg-[#2f756c]"
        to="/"
      >
        Back to school hub
      </Link>
    </StatusShell>
  );
}
