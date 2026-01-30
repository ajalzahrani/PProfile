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
import { getUserDashboardData } from "@/actions/dashboards";
import { PermissionCheck } from "@/components/auth/permission-check";

export default async function DashboardPage() {
  await checkServerPermission("manage:dashboards");

  const { data, error } = await getUserDashboardData();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <PageShell>
      <PageHeader
        heading="Dashboard"
        text="Overview of compliance documents and reports">
        <Link href="/documents/new">
          <PermissionCheck required="create:document">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Document
            </Button>
          </PermissionCheck>
        </Link>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* <ExampleTranslation /> */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.totalDocuments ?? 0} out of {data?.totalRequired ?? 0}{" "}
            </div>
            <p className="text-xs text-muted-foreground">
              All uploaded documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active documents requiring attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data &&
              !isNaN(data.uploaded / data.totalRequired) &&
              data.totalRequired > 0
                ? ((data.uploaded / data.totalRequired) * 100).toFixed(0)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Required & uploaded certificates documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.compliancePercent ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compliance documents
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Document trends over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2"></CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Recently uploaded documents</CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
