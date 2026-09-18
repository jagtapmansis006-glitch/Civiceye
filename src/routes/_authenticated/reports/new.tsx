import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportForm } from "@/components/reports/ReportForm";

export const Route = createFileRoute("/_authenticated/reports/new")({
  head: () => ({ meta: [{ title: "Create report — CivicEye" }] }),
  component: CreateReportPage,
});

function CreateReportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="New report"
        title="Report a civic issue"
        description="Four quick steps. You'll get a reference number as soon as it's submitted."
      />
      <ReportForm />
    </div>
  );
}
