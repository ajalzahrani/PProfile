import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { checkServerPermission } from "@/lib/server-permissions";
import { getAdminDashboardData } from "@/actions/dashboards";
import { ExampleTranslation } from "@/components/example-translation";
import { PermissionCheck } from "@/components/auth/permission-check";
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
      <ReportsClient
        initialOccurrences={occurrences}
        initialStatistics={statistics}
        filterOptions={filterOptions}
      />
    </PageShell>
  );
}
