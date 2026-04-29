import { env } from "./env";

export function App() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl rounded-3xl border border-red-900/50 bg-neutral-900/80 p-8 shadow-2xl shadow-red-950/30">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-400">
          Better VPing
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
          Athletics staff intelligence dashboard
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-300">
          Phase 1 skeleton is wired for separate web and API deployments.
        </p>
        <div className="mt-8 rounded-2xl border border-neutral-800 bg-black/40 p-4 font-mono text-sm text-neutral-300">
          API base URL: {env.VITE_API_BASE_URL}
        </div>
      </section>
    </main>
  );
}
