import { Change, StaffRecord } from "../../schemas";

export function getRecordFields(record: StaffRecord) {
  return [
    { label: "Designation", value: record.title || "Unknown title" },
    {
      label: "Direct contact",
      value:
        [record.email, record.phone].filter(Boolean).join(" · ") ||
        "No direct contact listed",
    },
    { label: "Directory name", value: record.name },
  ];
}

export function getChangeBadgeClasses(type: Change["type"]) {
  if (type === "added")
    return "border-[#2f756c]/15 bg-[#dff4ef] text-[#2f756c]";
  if (type === "removed") return "border-[#e8b4a8] bg-[#fff4f1] text-[#8a3b2f]";
  if (type === "title_changed")
    return "border-[#9bb8b2]/50 bg-white/70 text-[#2f756c]";
  return "border-[#c8e6e0] bg-[#f1f8f6] text-[#526d68]";
}

export function formatChangeType(type: Change["type"]): string {
  if (type === "title_changed") return "Title changed";
  if (type === "contact_changed") return "Contact changed";
  return type[0].toUpperCase() + type.slice(1);
}
