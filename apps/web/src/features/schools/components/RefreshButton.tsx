export function RefreshButton({
  className = "",
  label = "Refresh scrape",
  onRefresh,
}: {
  className?: string;
  label?: string;
  onRefresh: () => Promise<void>;
}) {
  return (
    <button
      aria-label={label}
      className={`cursor-pointer inline-flex size-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#2f756c] shadow-sm transition hover:bg-white ${className}`}
      onClick={() => void onRefresh()}
      title={label}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M21 12a9 9 0 0 1-15.2 6.5" />
        <path d="M3 12A9 9 0 0 1 18.2 5.5" />
        <path d="M18 2v4h4" />
        <path d="M6 22v-4H2" />
      </svg>
    </button>
  );
}