import { Link, useParams } from "react-router-dom";
import { NotFoundPage } from "./NotFoundPage";

const mockSchools = [
  {
    id: "georgia",
    name: "University of Georgia",
    shortName: "Georgia",
    conference: "SEC",
    monogram: "UGA",
    current: 42,
    archived: 39,
    snapshot: "Wayback 2023",
  },
  {
    id: "virginia-tech",
    name: "Virginia Tech",
    shortName: "Virginia Tech",
    conference: "ACC",
    monogram: "VT",
    current: 36,
    archived: 34,
    snapshot: "Wayback 2022",
  },
  {
    id: "wittenberg",
    name: "Wittenberg University",
    shortName: "Wittenberg",
    conference: "NCAC",
    monogram: "WIT",
    current: 28,
    archived: 31,
    snapshot: "Wayback 2021",
  },
];

const mocks = {
  "1": {
    name: "Campus Signal",
    strategy: "Light but bolder. Navy, lime accents, crisp cards, subtle energy.",
  },
  "2": {
    name: "Archive Studio",
    strategy: "Warm archival palette. Sepia surfaces, ink text, timeline-like cards.",
  },
  "3": {
    name: "Command Center",
    strategy: "Serious analyst dashboard. Charcoal-blue, amber highlights, high contrast without red/black menace.",
  },
  "4": {
    name: "Varsity Clean",
    strategy: "Sporty college vibe. White canvas, bold color tabs, confident typography.",
  },
  "5": {
    name: "Library Glass",
    strategy: "Soft academic minimalism. Misty gradients, translucent panels, precise calm.",
  },
  "6": {
    name: "Bulletin Board",
    strategy: "Approachable campus noticeboard. Paper cards, pin accents, friendly contrast.",
  },
} as const;

type MockId = keyof typeof mocks;

export function DesignMockRoute() {
  const { mockId } = useParams<{ mockId: string }>();

  if (!mockId || !(mockId in mocks)) {
    return (
      <NotFoundPage
        eyebrow="Unknown mock"
        title="That design mock does not exist."
        body="Use /mocks/1 through /mocks/6."
      />
    );
  }

  if (mockId === "1") return <CampusSignalMock />;
  if (mockId === "2") return <ArchiveStudioMock />;
  if (mockId === "3") return <CommandCenterMock />;
  if (mockId === "4") return <VarsityCleanMock />;
  if (mockId === "5") return <LibraryGlassMock />;
  return <BulletinBoardMock />;
}

export function DesignMocksIndexPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f1] px-5 py-10 text-[#10231f] md:px-8">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#557066]">
          Better VPing design round two
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.04em] md:text-6xl">
          Six fresh mock directions. Current app styling untouched.
        </h1>
        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(mocks) as MockId[]).map((id) => (
            <Link
              key={id}
              className="rounded-3xl border border-[#d9dfd2] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              to={`/mocks/${id}`}
            >
              <p className="text-sm font-bold text-[#557066]">Mock {id}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">
                {mocks[id].name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5d6b67]">
                {mocks[id].strategy}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function MockNav({ active }: { active: MockId }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm">
      <Link className="rounded-full border border-current/20 bg-white/80 px-4 py-2 font-bold" to="/">
        Live app
      </Link>
      <Link className="rounded-full border border-current/20 bg-white/80 px-4 py-2 font-bold" to="/mocks">
        All mocks
      </Link>
      {(Object.keys(mocks) as MockId[]).map((id) => (
        <Link
          key={id}
          className={`rounded-full border border-current/20 px-4 py-2 font-bold ${
            active === id ? "bg-current text-white" : "bg-white/80"
          }`}
          to={`/mocks/${id}`}
        >
          {id}
        </Link>
      ))}
    </nav>
  );
}

function CampusSignalMock() {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7f9ee,#e6f4ef)] px-5 py-8 text-[#10231f] md:px-8">
      <section className="mx-auto max-w-7xl">
        <MockNav active="1" />
        <header className="grid gap-8 rounded-[2rem] border border-[#cbd8c8] bg-white/80 p-7 shadow-sm backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#587a00]">
              Campus Signal
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.045em] md:text-6xl">
              Staff changes, surfaced like a clean campus operations feed.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#49615b]">
              Fresh, bright, and readable. Lime accent adds bite without turning into sports-bar neon.
            </p>
          </div>
          <div className="rounded-3xl bg-[#142d28] p-6 text-white">
            <p className="text-sm font-bold text-[#d7ff5f]">Signal strength</p>
            <p className="mt-4 text-6xl font-extrabold tracking-[-0.06em]">97%</p>
            <p className="mt-2 text-sm text-white/70">sources reachable this cycle</p>
          </div>
        </header>
        <SchoolGrid card="signal" />
      </section>
    </main>
  );
}

function ArchiveStudioMock() {
  return (
    <main className="min-h-screen bg-[#eee4d0] px-5 py-8 text-[#251b13] md:px-8">
      <section className="mx-auto max-w-7xl">
        <MockNav active="2" />
        <header className="rounded-[2rem] border border-[#bfa98a] bg-[#fbf5e8] p-8 shadow-sm md:p-12">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[#8b5e2d]">
            Archive Studio
          </p>
          <h1 className="mt-4 max-w-5xl font-serif text-5xl font-bold tracking-[-0.045em] md:text-7xl">
            Compare today’s staff listings against yesterday’s public record.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6c5948]">
            More texture, less tech dashboard. Good if Wayback/archive work is core product story.
          </p>
        </header>
        <SchoolGrid card="archive" />
      </section>
    </main>
  );
}

function CommandCenterMock() {
  return (
    <main className="min-h-screen bg-[#111c24] px-5 py-8 text-[#eef6f2] md:px-8">
      <section className="mx-auto max-w-7xl">
        <MockNav active="3" />
        <header className="rounded-[2rem] border border-[#2e4652] bg-[radial-gradient(circle_at_80%_10%,#35515c,transparent_28rem),#162630] p-8 shadow-2xl shadow-black/20 md:p-12">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#f3c969]">
            Command Center
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.045em] md:text-7xl">
            High-contrast monitoring for directory intelligence.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#b6c8c5]">
            Dark, but blue-gray and amber replace the old red/black “dark web” mood.
          </p>
        </header>
        <SchoolGrid card="command" />
      </section>
    </main>
  );
}

function VarsityCleanMock() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 py-8 text-[#13202b] md:px-8">
      <section className="mx-auto max-w-7xl">
        <MockNav active="4" />
        <header className="rounded-[2rem] border border-[#dbe3ea] bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#2563eb]">
            Varsity Clean
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] md:text-7xl">
            A confident college-sports dashboard, cleaned up for work.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526171]">
            Crisp white surfaces, energetic color tabs, stronger hierarchy, no gothic vibe.
          </p>
        </header>
        <SchoolGrid card="varsity" />
      </section>
    </main>
  );
}

function LibraryGlassMock() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_15%,#d9f2ee,transparent_24rem),linear-gradient(135deg,#f6fbfa,#eef2ff)] px-5 py-8 text-[#14312f] md:px-8">
      <section className="mx-auto max-w-7xl">
        <MockNav active="5" />
        <header className="rounded-[2rem] border border-white/70 bg-white/55 p-8 shadow-xl shadow-[#9bb8b2]/20 backdrop-blur md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#2f756c]">
            Library Glass
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.045em] md:text-7xl">
            Quiet academic software with polished, modern depth.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526d68]">
            Airy glass panels and teal accents. Feels premium, calm, and less athletics-forward.
          </p>
        </header>
        <SchoolGrid card="glass" />
      </section>
    </main>
  );
}

function BulletinBoardMock() {
  return (
    <main className="min-h-screen bg-[#f6eddc] px-5 py-8 text-[#2a2219] md:px-8">
      <section className="mx-auto max-w-7xl">
        <MockNav active="6" />
        <header className="rounded-[2rem] border-2 border-[#d4b98d] bg-[#fff8ea] p-8 shadow-[8px_8px_0_#d8c39e] md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#9a5b20]">
            Bulletin Board
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.045em] md:text-7xl">
            Campus updates pinned where teams can scan them fast.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6f5b45]">
            Paper texture mood, chunky borders, warmer personality. Friendly without looking unserious.
          </p>
        </header>
        <SchoolGrid card="bulletin" />
      </section>
    </main>
  );
}

function SchoolGrid({ card }: { card: "signal" | "archive" | "command" | "varsity" | "glass" | "bulletin" }) {
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-3">
      {mockSchools.map((school) => {
        if (card === "command") return <CommandCard key={school.id} school={school} />;
        if (card === "archive") return <ArchiveCard key={school.id} school={school} />;
        if (card === "varsity") return <VarsityCard key={school.id} school={school} />;
        if (card === "glass") return <GlassCard key={school.id} school={school} />;
        if (card === "bulletin") return <BulletinCard key={school.id} school={school} />;
        return <SignalCard key={school.id} school={school} />;
      })}
    </div>
  );
}

type MockSchool = (typeof mockSchools)[number];

function SignalCard({ school }: { school: MockSchool }) {
  return (
    <article className="rounded-[1.75rem] border border-[#cbd8c8] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#eaff8f] px-3 py-1 text-sm font-extrabold text-[#314000]">{school.conference}</span>
        <span className="text-2xl font-extrabold text-[#142d28]">{school.monogram}</span>
      </div>
      <CardBody school={school} text="text-[#49615b]" />
    </article>
  );
}

function ArchiveCard({ school }: { school: MockSchool }) {
  return (
    <article className="rounded-none border border-[#8f7658] bg-[#fbf5e8] p-6 shadow-sm">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#8b5e2d]">{school.conference} / {school.monogram}</p>
      <CardBody school={school} text="text-[#6c5948]" />
    </article>
  );
}

function CommandCard({ school }: { school: MockSchool }) {
  return (
    <article className="rounded-[1.5rem] border border-[#2e4652] bg-[#172a34] p-6 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between text-[#f3c969]">
        <span className="text-sm font-bold">{school.conference}</span>
        <span className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black">{school.monogram}</span>
      </div>
      <CardBody school={school} text="text-[#b6c8c5]" dark />
    </article>
  );
}

function VarsityCard({ school }: { school: MockSchool }) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[#dbe3ea] bg-white shadow-sm">
      <div className="h-3 bg-[linear-gradient(90deg,#2563eb,#f59e0b)]" />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase text-[#2563eb]">{school.conference}</span>
          <span className="text-2xl font-black">{school.monogram}</span>
        </div>
        <CardBody school={school} text="text-[#526171]" />
      </div>
    </article>
  );
}

function GlassCard({ school }: { school: MockSchool }) {
  return (
    <article className="rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-lg shadow-[#9bb8b2]/15 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#dff4ef] px-3 py-1 text-sm font-bold text-[#2f756c]">{school.conference}</span>
        <span className="text-2xl font-semibold text-[#14312f]">{school.monogram}</span>
      </div>
      <CardBody school={school} text="text-[#526d68]" />
    </article>
  );
}

function BulletinCard({ school }: { school: MockSchool }) {
  return (
    <article className="rounded-[1.25rem] border-2 border-[#d4b98d] bg-[#fff8ea] p-6 shadow-[6px_6px_0_#d8c39e]">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#f4cf75] px-3 py-1 text-sm font-black text-[#4b321a]">{school.conference}</span>
        <span className="rotate-2 rounded-lg bg-[#2a2219] px-3 py-2 text-sm font-black text-white">{school.monogram}</span>
      </div>
      <CardBody school={school} text="text-[#6f5b45]" />
    </article>
  );
}

function CardBody({ school, text, dark = false }: { school: MockSchool; text: string; dark?: boolean }) {
  return (
    <>
      <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em]">{school.shortName}</h2>
      <p className={`mt-3 text-sm leading-6 ${text}`}>{school.snapshot}. Current staff directory monitored against archived baseline.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Metric label="Current" value={school.current} dark={dark} />
        <Metric label="Archived" value={school.archived} dark={dark} />
      </div>
    </>
  );
}

function Metric({ label, value, dark = false }: { label: string; value: number; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-2xl bg-white/10 p-4" : "rounded-2xl bg-black/[0.04] p-4"}>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className={dark ? "mt-1 text-xs font-bold uppercase tracking-[0.1em] text-white/55" : "mt-1 text-xs font-bold uppercase tracking-[0.1em] text-black/45"}>{label}</p>
    </div>
  );
}
