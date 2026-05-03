import { useEffect, useRef, useState } from "react";

const PREVIEW_TRANSITION_MS = 500;
type PreviewKind = "current" | "archived";

export function PreviewStage({
  currentUrl,
  archivedUrl,
}: {
  currentUrl: string;
  archivedUrl: string;
}) {
  const [activePreview, setActivePreview] = useState<PreviewKind>("current");
  const [exitingPreview, setExitingPreview] = useState<PreviewKind | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const activeIndex = activePreview === "current" ? 0 : 1;

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  function selectPreview(nextPreview: PreviewKind) {
    if (nextPreview === activePreview) {
      return;
    }

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    setExitingPreview(activePreview);
    setActivePreview(nextPreview);
    transitionTimeoutRef.current = window.setTimeout(() => {
      setExitingPreview(null);
      transitionTimeoutRef.current = null;
    }, PREVIEW_TRANSITION_MS);
  }

  return (
    <section className="border-t border-white/70 bg-[#14312f]/3 p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#2f756c]">
            Source
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#14312f] md:text-3xl">
            Before and after preview
          </h2>
        </div>
        <div className="flex rounded-full border border-white/70 bg-white/60 p-1 shadow-sm backdrop-blur">
          <PreviewTab
            active={activePreview === "current"}
            label="Current"
            onClick={() => selectPreview("current")}
          />
          <PreviewTab
            active={activePreview === "archived"}
            label="Archived"
            onClick={() => selectPreview("archived")}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.35rem]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          <div className="w-full shrink-0">
            <PagePreview
              active={activePreview === "current"}
              key={currentUrl}
              label="Current"
              previewModeVisible={
                activePreview === "current" || exitingPreview === "current"
              }
              url={currentUrl}
            />
          </div>
          <div className="w-full shrink-0">
            <PagePreview
              active={activePreview === "archived"}
              key={archivedUrl}
              label="Archived"
              previewModeVisible={
                activePreview === "archived" || exitingPreview === "archived"
              }
              url={archivedUrl}
            />
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
      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition ${
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

function PagePreview({
  active,
  label,
  previewModeVisible,
  url,
}: {
  active: boolean;
  label: string;
  previewModeVisible: boolean;
  url: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [dismissedFallback, setDismissedFallback] = useState(false);
  const [navigationEnabled, setNavigationEnabled] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(active);

  useEffect(() => {
    setLoaded(false);
    setTimedOut(false);
    setDismissedFallback(false);
    setNavigationEnabled(false);
    setShouldLoad(false);
  }, [url]);

  useEffect(() => {
    if (active) {
      setShouldLoad(true);
    }
  }, [active, url]);

  useEffect(() => {
    if (!active || !shouldLoad || loaded) {
      return;
    }

    const id = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(id);
  }, [active, loaded, shouldLoad, url]);

  const showFallback = active && timedOut && !loaded && !dismissedFallback;

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
        {shouldLoad ? (
          <iframe
            className="h-full w-full bg-white"
            onLoad={() => setLoaded(true)}
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts"
            src={url}
            title={`${label} preview`}
          />
        ) : null}
        {previewModeVisible && !navigationEnabled ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#14312f]/25 p-6 text-center backdrop-blur-[1px]">
            <div className="max-w-sm rounded-3xl border border-white/70 bg-white/95 p-5 shadow-2xl shadow-[#14312f]/20">
              <p className="text-xs font-black uppercase tracking-wide text-[#2f756c]">
                Preview mode
              </p>
              <p className="mt-2 text-sm leading-6 text-[#526d68]">
                Click through when you want to explore source page directly.
              </p>
              <button
                className="mt-4 rounded-full bg-[#14312f] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-[#2f756c]"
                onClick={() => setNavigationEnabled(true)}
                type="button"
              >
                Explore page
              </button>
            </div>
          </div>
        ) : null}
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
