import { cn } from "@/lib/utils";
import { REPORT_CATEGORIES } from "@/lib/report-categories";
import type { ReportCategory } from "@/types";

export function CategoryPicker({
  value,
  onChange,
}: {
  value: ReportCategory | null;
  onChange: (value: ReportCategory) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Issue category"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {REPORT_CATEGORIES.map((cat) => {
        const selected = cat.value === value;
        return (
          <button
            key={cat.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(cat.value)}
            className={cn(
              "rounded-xl p-4 text-left ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-civic text-primary-foreground ring-civic"
                : "bg-glass ring-black/5 hover:bg-glass-strong",
            )}
          >
            <p className="text-sm font-semibold">{cat.label}</p>
            <p
              className={cn(
                "mt-1 text-xs",
                selected ? "text-primary-foreground/70" : "text-ink/50",
              )}
            >
              {cat.department}
            </p>
          </button>
        );
      })}
    </div>
  );
}
