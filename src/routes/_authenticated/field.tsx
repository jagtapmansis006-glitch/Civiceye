import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGate } from "@/components/layout/RoleGate";
import { EmptyState, ErrorState, LoadingState } from "@/components/layout/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { ReportList } from "@/components/reports/ReportList";
import { useAssignedReports, useReportsRealtime } from "@/hooks/useReports";

export const Route = createFileRoute("/_authenticated/field")({
  head: () => ({ meta: [{ title: "Field work — CivicEye" }] }),
  component: () => (
    <RoleGate allow={["field_worker"]}>
      <FieldDashboard />
    </RoleGate>
  ),
});

function FieldDashboard() {
  const reports = useAssignedReports();
  useReportsRealtime();
  const all = reports.data ?? [];
  const queued = all.filter((r) => r.status === "assigned");
  const active = all.filter((r) => r.status === "in_progress");
  const done = all.filter((r) => ["resolved", "citizen_verification", "closed"].includes(r.status));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Field worker"
        title="My work queue"
        description="Jobs assigned to you. Open a report to start work or mark it resolved."
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Queued" value={queued.length} />
        <StatCard label="In progress" value={active.length} tone="signal" />
        <StatCard label="Completed" value={done.length} tone="verd" />
      </div>

      {reports.isPending && <LoadingState />}
      {reports.isError && <ErrorState error={reports.error} />}
      {reports.isSuccess && all.length === 0 && (
        <EmptyState
          title="No assignments yet"
          description="Reports assigned to you by the authority desk will show up here."
        />
      )}
      {reports.isSuccess && all.length > 0 && (
        <>
          {[...queued, ...active].length > 0 && (
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-semibold text-civic-deep">Active</h2>
              <ReportList reports={[...active, ...queued]} />
            </section>
          )}
          {done.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-serif text-lg font-semibold text-civic-deep">Completed</h2>
              <ReportList reports={done} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
