import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPersons } from "@/actions/persons";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { PersonList } from "./components/persons-list";
import { PlusCircle } from "lucide-react";
import { checkServerPermission } from "@/lib/server-permissions";
import { notFound } from "next/navigation";
export default async function PersonsPage() {
  await checkServerPermission("manage:persons");

  const persons = await getPersons();

  if (!persons.success) {
    return notFound();
  }

  return (
    <PageShell>
      <PageHeader heading="Persons" text="Manage and track persons">
        <Link href="/persons/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Person
          </Button>
        </Link>
      </PageHeader>

      <PersonList persons={persons.persons || []} />
    </PageShell>
  );
}
