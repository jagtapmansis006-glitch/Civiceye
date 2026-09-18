import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { REPORT_STATUS, REPORT_STATUS_ORDER, statusIndex } from "@/lib/report-status";
import type { ReportStatus, ReportStatusHistory } from "@/types";

/** Compact 8-step pipeline (used on landing and cards). */
export function StatusPipeline({ current }: { current?: ReportStatus }) {
  const currentIdx = current ? statusIndex(current) : -1;
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {REPORT_STATUS_ORDER.map((status, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <li key={status} className="flex items-center gap-2.5">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ring-1",
                done && "bg-verd/15 text-verd ring-verd/25",
                active && "bg-signal text-civic-deep ring-signal/40",
                !done && !active && "bg-glass text-ink/40 ring-black/10",
              )}
              aria-hidden
            >
              {idx + 1}
            </span>
            <span className={cn("text-sm", active ? "font-semibold text-ink" : done ? "text-ink/70" : "text-ink/45")}>
              {REPORT_STATUS[status].shortLabel}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Vertical audit trail for a report, from status history rows. */
export function StatusTimeline({
  history,
  current,
}: {
  history: ReportStatusHistory[];
  current: ReportStatus;
}) {
  const currentIdx = statusIndex(current);
  const reached = new Map<ReportStatus, string>();
  for (const h of history) reached.set(h.to_status, h.created_at);

  return (
    <ol className="space-y-0">
      {REPORT_STATUS_ORDER.map((status, idx) => {
        const at = reached.get(status);
        const done = idx < currentIdx || (idx === currentIdx && status === "closed");
        const active = idx === currentIdx && status !== "closed";
        const meta = REPORT_STATUS[status];
        return (
          <li key={status} className="relative flex gap-3 pb-5 last:pb-0">
            {idx < REPORT_STATUS_ORDER.length - 1 && (
              <span className="absolute top-6 left-[11px] h-[calc(100%-1.5rem)] w-px bg-black/10" aria-hidden />
            )}
            <span
              className={cn(
                "z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ring-1",
                done && "bg-verd/15 text-verd ring-verd/25",
                active && "bg-signal text-civic-deep ring-signal/40",
                !done && !active && "bg-glass text-ink/40 ring-black/10",
              )}
              aria-hidden
            >
              {idx + 1}
            </span>
            <div>
              <p className={cn("text-sm", active || done ? "font-semibold text-ink" : "text-ink/50")}>{meta.label}</p>
              <p className="text-xs text-ink/55">
                {at ? format(new Date(at), "d MMM yyyy, HH:mm") : meta.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
