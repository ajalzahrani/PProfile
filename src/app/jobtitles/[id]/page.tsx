import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getJobTitleById } from "@/actions/jobtitles";

export default async function JobTitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const jobTitleId = (await params).id;

  // Get jobTitle by ID
  const jobTitle = await getJobTitleById(jobTitleId);

  console.log(jobTitle);

  if (!jobTitle) {
    notFound();
  }

  return (
    <PageShell>
      <PageHeader
        heading={`${jobTitle.jobTitle?.nameEn} JobTitle`}
        text="Manage jobTitle">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/jobtitles">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to JobTitles
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/jobtitles/${jobTitleId}/edit`}>Edit JobTitle</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            {jobTitle.jobTitle?.nameEn}
          </CardHeader>
        </Card>
      </div>
    </PageShell>
  );
}
