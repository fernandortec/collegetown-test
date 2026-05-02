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
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,#d9f2ee,transparent_24rem),linear-gradient(135deg,#f6fbfa,#eef2ff)] px-5 py-10 text-[#14312f] md:px-8">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-xl shadow-[#9bb8b2]/20 backdrop-blur">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2f756c]">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-6xl">
          {title}
        </h1>
        {children}
      </section>
    </main>
  );
}
