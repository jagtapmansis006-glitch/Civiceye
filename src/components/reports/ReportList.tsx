import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/ui/status-badge";
import { categoryLabel } from "@/lib/report-categories";
import type { Report } from "@/types";

export function ReportList({ reports }: { reports: Report[] }) {
  return (
    <div className="glass-panel-strong overflow-hidden">
      <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_1.2fr] gap-3 border-b border-black/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45 sm:grid">
        <span>Report</span>
        <span>Location</span>
        <span>Updated</span>
        <span className="text-right">Status</span>
      </div>
      <ul className="divide-y divide-black/5">
        {reports.map((report) => (
          <li key={report.id}>
            <Link
              to="/reports/$id"
              params={{ id: report.id }}
              className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-glass-strong sm:grid-cols-[1.6fr_1fr_0.8fr_1.2fr] sm:gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{report.title}</p>
                <p className="text-xs text-ink/50">
                  {categoryLabel(report.category)} · {report.reference_code}
                </p>
              </div>
              <p className="text-sm text-ink/65">
                {report.address ||
                  (report.latitude != null && report.longitude != null
                    ? `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`
                    : "No location")}
              </p>
              <p className="text-sm text-ink/65">
                {formatDistanceToNow(new Date(report.updated_at), { addSuffix: true })}
              </p>
              <div className="sm:text-right">
                <StatusBadge status={report.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
