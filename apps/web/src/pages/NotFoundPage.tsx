import { StatusShell } from "../shared/components/StatusShell";

interface NotFoundPageProps {
  eyebrow: string;
  title: string;
  body: string;
  onNavigate: (path: string) => void;
}

export function NotFoundPage({
  eyebrow,
  title,
  body,
  onNavigate,
}: NotFoundPageProps) {
  return (
    <StatusShell eyebrow={eyebrow} title={title}>
      <p className="mt-5 max-w-2xl text-neutral-300">{body}</p>
      <button
        className="mt-6 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-neutral-950 hover:bg-red-100"
        type="button"
        onClick={() => onNavigate("/")}
      >
        Back to school hub
      </button>
    </StatusShell>
  );
}
