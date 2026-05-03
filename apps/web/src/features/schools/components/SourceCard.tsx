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
    <article className="flex flex-col items-start justify-between rounded-[1.75rem] border border-white/70 bg-white/60 p-6 shadow-lg shadow-[#9bb8b2]/10 backdrop-blur">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f756c]">{label}</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#14312f]">
          {title}
        </h2>
        <p className="mt-4 break-all rounded-2xl border border-white/70 bg-white/55 px-4 py-3 font-mono text-xs leading-5 text-[#526d68]">
          {url}
        </p>
      </div>
      <a
        className="mt-5 inline-flex rounded-full border border-[#9bb8b2]/50 bg-white/50 px-4 py-2 text-sm font-bold text-[#14312f] transition hover:border-[#2f756c] hover:text-[#2f756c]"
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        Open source
      </a>
    </article>
  );
}
