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
    <article className="rounded-3xl border border-white/10 bg-neutral-950/80 p-5">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">
        {label}
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
        {title}
      </h2>
      <p className="mt-4 break-all rounded-2xl bg-black/50 p-3 font-mono text-xs leading-5 text-neutral-300">
        {url}
      </p>
      <a
        className="mt-4 inline-flex rounded-full border border-red-800/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-200 hover:border-red-500 hover:text-white"
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        Open source
      </a>
    </article>
  );
}
