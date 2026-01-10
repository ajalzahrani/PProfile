import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDepartmentById } from "@/actions/departments";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const departmentId = (await params).id;

  // Get department by ID
  const department = await getDepartmentById(departmentId);

  console.log(department);

  if (!department) {
    notFound();
  }

  return (
    <PageShell>
      <PageHeader
        heading={`${department.department?.name} Department`}
        text="Manage department">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/departments">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/departments/${departmentId}/edit`}>
              Edit Department
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            {department.department?.name}
          </CardHeader>
        </Card>
      </div>
    </PageShell>
  );
}
