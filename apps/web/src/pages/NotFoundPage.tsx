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
      <p className="mt-5 max-w-2xl text-neutral-300">{body}</p>
      <Link
        className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-neutral-950 hover:bg-red-100"
        to="/"
      >
        Back to school hub
      </Link>
    </StatusShell>
  );
}
