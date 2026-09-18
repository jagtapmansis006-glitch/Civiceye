import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReportList } from "@/components/reports/ReportList";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMyReports, useReportsRealtime } from "@/hooks/useReports";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CivicEye" }] }),
  component: CitizenDashboard,
});

function CitizenDashboard() {
  const { profile, user } = useAuth();
  const reports = useMyReports();
  useReportsRealtime();

  const all = reports.data ?? [];
  const open = all.filter((r) => r.status !== "closed").length;
  const inProgress = all.filter((r) => ["assigned", "in_progress"].includes(r.status)).length;
  const resolved = all.filter((r) => ["resolved", "citizen_verification", "closed"].includes(r.status)).length;
  const awaitingYou = all.filter((r) => r.status === "citizen_verification");

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Citizen dashboard"
        title={`Good day, ${firstName}`}
        description="Your reports, their current stage, and anything waiting on you."
        actions={
          <Button asChild>
            <Link to="/reports/new">Report an issue</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total reports" value={all.length} />
        <StatCard label="Open" value={open} tone="civic" />
        <StatCard label="Being worked on" value={inProgress} tone="signal" />
        <StatCard label="Resolved" value={resolved} tone="verd" />
      </div>

      {awaitingYou.length > 0 && (
        <div className="rounded-xl bg-verd-soft p-4 ring-1 ring-verd/20">
          <p className="text-sm font-semibold text-verd">
            {awaitingYou.length} report{awaitingYou.length > 1 ? "s" : ""} waiting for your confirmation
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {awaitingYou.map((r) => (
              <li key={r.id}>
                <Link to="/reports/$id" params={{ id: r.id }} className="text-civic underline-offset-4 hover:underline">
                  {r.reference_code} · {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-civic-deep">Recent reports</h2>
          <Link to="/reports" className="text-sm font-medium text-civic hover:underline">
            View all
          </Link>
        </div>
        {reports.isPending && <LoadingState label="Loading your reports…" />}
        {reports.isError && <ErrorState error={reports.error} />}
        {reports.isSuccess && all.length === 0 && (
          <EmptyState
            title="No reports yet"
            description="When you file your first report it will appear here with a live status."
            action={
              <Button asChild>
                <Link to="/reports/new">Create your first report</Link>
              </Button>
            }
          />
        )}
        {reports.isSuccess && all.length > 0 && <ReportList reports={all.slice(0, 5)} />}
      </section>
    </div>
  );
}
