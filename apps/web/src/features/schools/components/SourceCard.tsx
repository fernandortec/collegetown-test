import { Link } from "react-router-dom";

export function SourceCard({
  label,
  title,
  url,
}: {
  label: string;
  title: string;
  url: string;
}) {
  return (
    <article className="rounded-[2rem] border border-white/70 bg-white/60 p-5 shadow-lg shadow-[#9bb8b2]/10 backdrop-blur">
      <p className="text-xs font-bold uppercase  text-[#2f756c]">{label}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#14312f]">
        {title}
      </h2>
      <p className="mt-4 break-all rounded-2xl border border-white/70 bg-white/55 p-3 font-mono text-xs leading-5 text-[#526d68]">
        {url}
      </p>
      <Link
        className="mt-4 inline-flex rounded-full border border-[#9bb8b2]/50 bg-white/50 px-4 py-2 text-sm font-bold text-[#14312f] hover:border-[#2f756c] hover:text-[#2f756c]"
        to={url}
        rel="noreferrer"
        target="_blank"
      >
        Open source
      </Link>
    </article>
  );
}
