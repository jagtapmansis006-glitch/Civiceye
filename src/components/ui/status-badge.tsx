import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { REPORT_STATUS, type StatusTone } from "@/lib/report-status";
import type { ReportStatus } from "@/types";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "text-ink/70 ring-black/10 bg-glass-strong",
        civic: "text-civic ring-civic/15 bg-civic/5",
        signal: "text-signal ring-signal/25 bg-signal/10",
        verd: "text-verd ring-verd/25 bg-verd/10",
      } satisfies Record<StatusTone, string>,
    },
    defaultVariants: { tone: "neutral" },
  },
);

const dot = cva("size-1.5 rounded-full", {
  variants: {
    tone: {
      neutral: "bg-ink/40",
      civic: "bg-civic/60",
      signal: "bg-signal",
      verd: "bg-verd",
    } satisfies Record<StatusTone, string>,
  },
});

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const meta = REPORT_STATUS[status];
  return (
    <span className={cn(badge({ tone: meta.tone }), className)}>
      <span className={dot({ tone: meta.tone })} aria-hidden />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="text-xs text-muted-foreground">—</span>;
  const tone = priority === "critical" || priority === "high" ? "alert" : priority === "medium" ? "signal" : "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
        tone === "alert" && "bg-alert/10 text-alert ring-alert/25",
        tone === "signal" && "bg-signal/10 text-signal ring-signal/25",
        tone === "neutral" && "bg-glass-strong text-ink/60 ring-black/10",
      )}
    >
      {priority}
    </span>
  );
}
