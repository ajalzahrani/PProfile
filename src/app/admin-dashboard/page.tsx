import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { checkServerPermission } from "@/lib/server-permissions";
import { getAdminDashboardData } from "@/actions/dashboards";
import { ReportsClient } from "./components/reports-client";

export default async function DashboardPage() {
  await checkServerPermission("manage:admin-dashboards");
  const { dashboardDTO, error } = await getAdminDashboardData();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <PageShell>
      <PageHeader
        heading="Dashboard"
        text="Overview of compliance documents and reports"
      />
      {/* <ReportsClient
        initialOccurrences={occurrences}
        initialStatistics={statistics}
        filterOptions={filterOptions}
        dashboardDTO={dashboardDTO}
      /> */}
    </PageShell>
  );
}
