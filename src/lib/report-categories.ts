import type { ReportCategory } from "@/types";

export interface CategoryMeta {
  value: ReportCategory;
  label: string;
  department: string;
  hint: string;
}

export const REPORT_CATEGORIES: CategoryMeta[] = [
  {
    value: "pothole",
    label: "Pothole",
    department: "Roads",
    hint: "Holes or sinking in the road surface",
  },
  {
    value: "garbage",
    label: "Garbage accumulation",
    department: "Sanitation",
    hint: "Overflowing bins or dumped waste",
  },
  {
    value: "streetlight",
    label: "Broken streetlight",
    department: "Lighting",
    hint: "Lights out, flickering or damaged poles",
  },
  {
    value: "damaged_road",
    label: "Damaged road",
    department: "Roads",
    hint: "Cracks, broken edges, missing surface",
  },
  {
    value: "drainage",
    label: "Drainage problem",
    department: "Water",
    hint: "Blocked drains or standing water",
  },
  {
    value: "water_leakage",
    label: "Water leakage",
    department: "Utilities",
    hint: "Leaking pipes, mains or hydrants",
  },
  {
    value: "infrastructure",
    label: "Public infrastructure damage",
    department: "Safety",
    hint: "Benches, signage, railings, footpaths",
  },
  {
    value: "other",
    label: "Other civic issue",
    department: "General",
    hint: "Anything else that needs attention",
  },
];

export const CATEGORY_BY_VALUE: Record<ReportCategory, CategoryMeta> = Object.fromEntries(
  REPORT_CATEGORIES.map((c) => [c.value, c]),
) as Record<ReportCategory, CategoryMeta>;

export function categoryLabel(value: ReportCategory): string {
  return CATEGORY_BY_VALUE[value]?.label ?? value;
}
