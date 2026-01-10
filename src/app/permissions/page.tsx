import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPermissions } from "@/actions/permissions";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PermissionList } from "./components/permissions-list";
import { checkServerPermission } from "@/lib/server-permissions";

export default async function PermissionsPage() {
  await checkServerPermission("manage:permissions");
  const permissions = await getPermissions();

  if (!permissions.success) {
    return notFound();
  }

  return (
    <PageShell>
      <PageHeader heading="Permissions" text="Manage and track permissions">
        <Link href="/permissions/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Permission
          </Button>
        </Link>
      </PageHeader>

      <PermissionList permissions={permissions.permissions || []} />
    </PageShell>
  );
}
