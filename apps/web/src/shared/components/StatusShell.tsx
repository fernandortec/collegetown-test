import type { ReactNode } from "react";

export function StatusShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#120508] px-5 py-10 text-white md:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-red-900/40 bg-neutral-950/80 p-8 shadow-2xl shadow-red-950/30">
        <p className="text-xs font-black uppercase tracking-[0.4em] text-red-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] md:text-6xl">
          {title}
        </h1>
        {children}
      </section>
    </main>
  );
}
