import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { checkServerPermission } from "@/lib/server-permissions";
import { getAdminDashboardStats } from "@/actions/dashboards";
import { AdminDashboardCharts } from "./components/admin-dashboard-charts";

export default async function DashboardPage() {
  await checkServerPermission("manage:admin-dashboards");
  const { dashboardDTO, error } = await getAdminDashboardStats();

  if (error) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">Error</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!dashboardDTO) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">No Data Available</p>
            <p className="text-muted-foreground">
              Dashboard data could not be loaded.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        heading="Admin Dashboard"
        text="Comprehensive overview of system statistics and analytics"
      />
      <AdminDashboardCharts dashboardDTO={dashboardDTO} />
    </PageShell>
  );
}
