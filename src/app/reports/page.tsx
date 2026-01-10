import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";

export default async function ReportsPage() {
  return (
    <PageShell>
      <PageHeader
        heading="Reports"
        text="View and generate reports"></PageHeader>
    </PageShell>
  );
}
