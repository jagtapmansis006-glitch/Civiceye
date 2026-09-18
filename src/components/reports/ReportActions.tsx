import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useAssignReport, useFieldWorkers, useUpdateReportStatus } from "@/hooks/useReports";
import { REPORT_STATUS } from "@/lib/report-status";
import type { Report, ReportPriority, ReportStatus } from "@/types";

function describe(err: unknown) {
  return err instanceof Error ? err.message : "Action failed";
}

/** Role-aware actions for a single report. Every action is a real database write guarded by RLS. */
export function ReportActions({ report }: { report: Report }) {
  const { user, roles } = useAuth();
  const isStaff = roles.includes("authority") || roles.includes("admin");
  const isWorker = roles.includes("field_worker") && report.assigned_to === user?.id;
  const isReporter = report.reporter_id === user?.id;

  const updateStatus = useUpdateReportStatus(report.id);

  async function setStatus(status: ReportStatus, label: string) {
    try {
      await updateStatus.mutateAsync(status);
      toast.success(label);
    } catch (err) {
      toast.error(describe(err));
    }
  }

  const busy = updateStatus.isPending;

  return (
    <div className="space-y-5">
      {isReporter && report.status === "citizen_verification" && (
        <ActionGroup title="Confirm the fix" hint="The field team marked this resolved. Does it look right to you?">
          <Button onClick={() => setStatus("closed", "Thanks — report closed")} disabled={busy}>
            Yes, it's fixed
          </Button>
          <Button variant="soft" onClick={() => setStatus("in_progress", "Sent back to the field team")} disabled={busy}>
            Not fixed yet
          </Button>
        </ActionGroup>
      )}

      {isWorker && (
        <ActionGroup title="Field update" hint="Progress the job as you work on it.">
          {report.status === "assigned" && (
            <Button onClick={() => setStatus("in_progress", "Marked in progress")} disabled={busy}>
              Start work
            </Button>
          )}
          {report.status === "in_progress" && (
            <Button onClick={() => setStatus("resolved", "Marked resolved")} disabled={busy}>
              Mark resolved
            </Button>
          )}
          {!["assigned", "in_progress"].includes(report.status) && (
            <p className="text-sm text-ink/55">No field action available at this stage.</p>
          )}
        </ActionGroup>
      )}

      {isStaff && <AuthorityActions report={report} setStatus={setStatus} busy={busy} />}
    </div>
  );
}

function AuthorityActions({
  report,
  setStatus,
  busy,
}: {
  report: Report;
  setStatus: (s: ReportStatus, label: string) => Promise<void>;
  busy: boolean;
}) {
  const workers = useFieldWorkers();
  const assign = useAssignReport(report.id);
  const [workerId, setWorkerId] = useState<string>(report.assigned_to ?? "");
  const [priority, setPriority] = useState<ReportPriority | "">(report.priority ?? "");

  async function handleAssign() {
    if (!workerId) {
      toast.error("Choose a field worker first");
      return;
    }
    try {
      await assign.mutateAsync({ assignedTo: workerId, priority: priority || null });
      toast.success("Report assigned");
    } catch (err) {
      toast.error(describe(err));
    }
  }

  const canVerify = report.status === "submitted" || report.status === "ai_analysis";

  return (
    <>
      {canVerify && (
        <ActionGroup title="Verification" hint="Confirm the issue is genuine before assigning a crew.">
          <Button onClick={() => setStatus("verified", "Report verified")} disabled={busy}>
            Mark verified
          </Button>
          <Button variant="soft" onClick={() => setStatus("closed", "Report closed")} disabled={busy}>
            Reject & close
          </Button>
        </ActionGroup>
      )}

      {report.status === "resolved" && (
        <ActionGroup title="Hand to citizen" hint="Ask the reporter to confirm the fix.">
          <Button onClick={() => setStatus("citizen_verification", "Sent for citizen verification")} disabled={busy}>
            Request citizen verification
          </Button>
        </ActionGroup>
      )}

      <ActionGroup title="Assignment" hint="Route the report to a field worker and set a priority.">
        <div className="grid w-full gap-3 sm:grid-cols-[1fr_160px_auto]">
          <div className="space-y-1.5">
            <Label>Field worker</Label>
            <Select value={workerId} onValueChange={setWorkerId}>
              <SelectTrigger aria-label="Field worker">
                <SelectValue placeholder={workers.isPending ? "Loading…" : "Choose a field worker"} />
              </SelectTrigger>
              <SelectContent>
                {workers.data?.length === 0 && (
                  <div className="px-3 py-2 text-sm text-ink/55">No field workers yet — grant the role in Administration.</div>
                )}
                {workers.data?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.full_name || w.email || w.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as ReportPriority)}>
              <SelectTrigger aria-label="Priority">
                <SelectValue placeholder="Unset" />
              </SelectTrigger>
              <SelectContent>
                {(["low", "medium", "high", "critical"] as ReportPriority[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAssign} disabled={assign.isPending || !workerId}>
              {report.assigned_to ? "Reassign" : "Assign"}
            </Button>
          </div>
        </div>
      </ActionGroup>

      <ActionGroup title="Current stage" hint={REPORT_STATUS[report.status].description}>
        <p className="text-sm text-ink/60">
          Status changes are recorded in the audit trail with your account.
        </p>
      </ActionGroup>
    </>
  );
}

function ActionGroup({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-civic/[0.04] p-4 ring-1 ring-black/5">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-xs text-ink/55">{hint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
