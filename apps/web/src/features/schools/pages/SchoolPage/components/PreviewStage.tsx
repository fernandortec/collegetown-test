import { useEffect, useState } from "react";

export function PreviewStage({
  currentUrl,
  archivedUrl,
}: {
  currentUrl: string;
  archivedUrl: string;
}) {
  const [activePreview, setActivePreview] = useState<"current" | "archived">(
    "current",
  );
  const activeIndex = activePreview === "current" ? 0 : 1;

  return (
    <section className="border-t border-white/70 bg-[#14312f]/3 p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2f756c]">
            Source
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#14312f] md:text-3xl">
            Before and after preview
          </h2>
        </div>
        <div className="flex rounded-full border border-white/70 bg-white/60 p-1 shadow-sm backdrop-blur">
          <PreviewTab
            active={activePreview === "current"}
            label="Current"
            onClick={() => setActivePreview("current")}
          />
          <PreviewTab
            active={activePreview === "archived"}
            label="Archived"
            onClick={() => setActivePreview("archived")}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.35rem]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          <div className="w-full shrink-0">
            <PagePreview key={currentUrl} label="Current" url={currentUrl} />
          </div>
          <div className="w-full shrink-0">
            <PagePreview key={archivedUrl} label="Archived" url={archivedUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
        active
          ? "bg-[#14312f] text-white shadow-sm"
          : "text-[#526d68] hover:text-[#14312f]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function PagePreview({ label, url }: { label: string; url: string }) {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [dismissedFallback, setDismissedFallback] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(id);
  }, []);

  const showFallback = timedOut && !loaded && !dismissedFallback;

  return (
    <article className="overflow-hidden rounded-[1.35rem]  border border-[#d8e8e4] bg-[#0f2422] shadow-xl shadow-[#9bb8b2]/90">
      <header className="flex items-center gap-3 border-b border-white/10 bg-[#14312f] px-4 py-3 text-white">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff6b5f]" />
          <span className="size-2.5 rounded-full bg-[#f6c85f]" />
          <span className="size-2.5 rounded-full bg-[#7bd88f]" />
        </div>
        <div className="min-w-0 flex-1 rounded-full bg-white/10 px-3 py-1.5">
          <p className="truncate font-mono text-[0.68rem] text-white/70">
            {url}
          </p>
        </div>
        <span className="hidden text-xs font-black uppercase  text-[#dff4ef] sm:block">
          {label}
        </span>
        <a
          className="inline-flex shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase  text-[#14312f] transition hover:bg-[#dff4ef]"
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          Open
        </a>
      </header>
      <div className="relative h-[42vh] min-h-168 bg-white">
        {!loaded && !showFallback && !dismissedFallback ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center text-[#14312f]/70">
            <div>
              <p className="text-sm font-black uppercase  text-[#2f756c]">
                Loading {label.toLowerCase()} preview
              </p>
            </div>
          </div>
        ) : null}
        <iframe
          className="h-full w-full bg-white"
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts"
          src={url}
          title={`${label} preview`}
        />
        {showFallback ? (
          <div className="absolute bottom-4 right-4 z-10 max-w-sm rounded-2xl border border-[#d8e8e4] bg-white/95 p-4 text-left shadow-2xl shadow-[#14312f]/20 backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase text-[#8a3b2f]">
                  Preview blocked or slow
                </p>
                <p className="mt-2 text-sm leading-5 text-[#526d68]">
                  Source may block embedding. Report below still works.
                </p>
              </div>
              <button
                aria-label="Close preview warning"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-[#d8e8e4] text-sm font-black text-[#14312f] transition hover:border-[#2f756c] hover:text-[#2f756c]"
                onClick={() => setDismissedFallback(true)}
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
