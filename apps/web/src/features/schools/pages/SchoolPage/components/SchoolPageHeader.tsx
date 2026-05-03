import { withAlpha } from "../../../utils";

interface SchoolPageHeaderProps {
  school: {
    colors: { primary: string };
    monogram: string;
    conference: string;
    name: string;
  };
}

export function SchoolPageHeader({ school }: SchoolPageHeaderProps) {
  return (
    <div className="relative isolate overflow-hidden p-8 md:p-12">
      <div
        aria-hidden="true"
        className="absolute -right-8 top-4 -z-10 text-[8rem] font-semibold tracking-tighter opacity-10 md:text-[13rem]"
        style={{ color: school.colors.primary }}
      >
        {school.monogram}
      </div>
      <div className="flex items-center gap-3">
        <span
          className="rounded-2xl px-3 py-2 text-sm font-semibold text-white"
          style={{
            backgroundColor: withAlpha(school.colors.primary, "E6"),
          }}
        >
          {school.monogram}
        </span>
        <span className="rounded-full bg-[#dff4ef] px-3 py-1 text-sm font-bold text-[#2f756c] ring-1 ring-[#2f756c]/10">
          {school.conference}
        </span>
      </div>

      <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-7xl">
        {school.name}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-[#526d68]">
        Page runs live server-side extraction for current and archived
        staff directories, then shows raw structured records.
      </p>
    </div>
  );
}
