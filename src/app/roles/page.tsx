import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRoles } from "@/actions/roles";
import { PageHeader } from "@/components/page-header";
import { PageShell } from "@/components/page-shell";
import Link from "next/link";
import { RoleList } from "./components/role-list";
import { checkServerPermission } from "@/lib/server-permissions";
import { notFound } from "next/navigation";

export default async function RolesPage() {
  await checkServerPermission("manage:roles");
  const roles = await getRoles();

  if (!roles.success) {
    return notFound();
  }

  return (
    <PageShell>
      <PageHeader heading="Roles" text="Manage and track roles">
        <Link href="/roles/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </Link>
      </PageHeader>

      <RoleList roles={roles.roles ?? []} />
    </PageShell>
  );
}
