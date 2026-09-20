import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { ErrorState, LoadingState, EmptyState } from "@/components/layout/EmptyState";
import { StatusTimeline } from "@/components/reports/StatusTimeline";
import { ReportMediaGallery } from "@/components/reports/ReportMediaGallery";
import { ReportActions } from "@/components/reports/ReportActions";
import { PriorityBadge, StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useReport, useReportHistory, useReportsRealtime } from "@/hooks/useReports";
import { categoryLabel } from "@/lib/report-categories";
import { REPORT_STATUS } from "@/lib/report-status";

export const Route = createFileRoute("/_authenticated/reports/$id")({
  head: () => ({ meta: [{ title: "Report details — CivicEye" }] }),
  component: ReportDetailPage,
});

function ReportDetailPage() {
  const { id } = Route.useParams();
  const report = useReport(id);
  const history = useReportHistory(id);
  useReportsRealtime();

  if (report.isPending) return <LoadingState label="Loading report…" />;
  if (report.isError) return <ErrorState error={report.error} />;
  if (!report.data) {
    return (
      <EmptyState
        title="Report not found"
        description="It may not exist, or you may not have permission to view it."
        action={
          <Button asChild variant="soft">
            <Link to="/reports">Back to my reports</Link>
          </Button>
        }
      />
    );
  }

  const r = report.data;
  const hasLocation = r.latitude != null && r.longitude != null;

  return (
    <div className="space-y-6">
      <Link
        to="/reports"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-civic hover:underline"
      >
        <ArrowLeft className="size-4" /> My reports
      </Link>

      <div className="glass-panel p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">
              {r.reference_code} · {categoryLabel(r.category)}
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-civic-deep md:text-3xl">
              {r.title}
            </h1>
            <p className="mt-1 text-sm text-ink/55">
              Filed {format(new Date(r.created_at), "d MMM yyyy, HH:mm")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={r.priority} />
            <StatusBadge status={r.status} />
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-civic/[0.04] px-4 py-3 text-sm text-ink/70 ring-1 ring-black/5">
          {REPORT_STATUS[r.status].description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="glass-panel p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">Description</h2>
            <p className="mt-2 text-sm whitespace-pre-wrap text-ink/75">{r.description}</p>
          </section>

          <section className="glass-panel p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">Photos &amp; video</h2>
            <div className="mt-3">
              <ReportMediaGallery reportId={r.id} />
            </div>
          </section>

          <section className="glass-panel p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">Location</h2>
            {hasLocation ? (
              <div className="mt-2 space-y-1 text-sm text-ink/75">
                {r.address && <p>{r.address}</p>}
                <p className="font-mono text-xs text-ink/55">
                  {r.latitude!.toFixed(6)}, {r.longitude!.toFixed(6)}
                </p>
                <a
                  className="inline-block text-sm font-medium text-civic hover:underline"
                  href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=18/${r.latitude}/${r.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in map
                </a>
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink/55">No location was recorded.</p>
            )}
          </section>

          <section className="glass-panel p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">AI analysis</h2>
            {r.ai_analysis ? (
              <pre className="mt-2 overflow-auto rounded-lg bg-civic/[0.04] p-3 text-xs text-ink/75">
                {JSON.stringify(r.ai_analysis, null, 2)}
              </pre>
            ) : (
              <p className="mt-2 text-sm text-ink/55">
                Automated image and text analysis is not connected yet. Results will appear here
                once available.
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">Progress</h2>
            <div className="mt-4">
              {history.isPending && <p className="text-sm text-ink/55">Loading timeline…</p>}
              {history.isError && <ErrorState error={history.error} />}
              {history.isSuccess && <StatusTimeline history={history.data} current={r.status} />}
            </div>
          </section>

          <section className="glass-panel p-5">
            <h2 className="font-serif text-lg font-semibold text-ink">Actions</h2>
            <div className="mt-4">
              <ReportActions report={r} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
