import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { JobTitleList } from "./components/jobtitles-list";
import { getJobTitles } from "@/actions/jobtitles";
import { checkServerPermission } from "@/lib/server-permissions";
import { notFound } from "next/navigation";

export default async function JobTitlesPage() {
  await checkServerPermission("manage:jobtitles");

  const jobtitles = await getJobTitles();
  if (!jobtitles.success) {
    return notFound();
  }

  return (
    <PageShell>
      <PageHeader heading="JobTitles" text="Manage and track jobtitles">
        <Link href="/jobtitles/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create JobTitle
          </Button>
        </Link>
      </PageHeader>

      <JobTitleList jobtitles={jobtitles.jobTitles || []} />
    </PageShell>
  );
}
