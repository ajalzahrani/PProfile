import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/actions/users";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { UserList } from "./components/users-list";
import { PlusCircle } from "lucide-react";
import { checkServerPermission } from "@/lib/server-permissions";
import { notFound } from "next/navigation";
export default async function UsersPage() {
  await checkServerPermission("manage:users");

  const users = await getUsers();

  if (!users.success) {
    return notFound();
  }

  return (
    <PageShell>
      <PageHeader heading="Users" text="Manage and track users">
        <Link href="/users/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </Link>
      </PageHeader>

      <UserList users={users.users || []} />
    </PageShell>
  );
}
