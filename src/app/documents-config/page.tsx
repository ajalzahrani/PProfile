import { prisma } from "@/lib/prisma";
import { RequirementToggle } from "./components/requirement-toggle";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { getJobTitles } from "@/actions/jobtitles";
import { getCategories } from "@/actions/categories";
import { getCertificateRequirements } from "@/actions/document-configs";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionCheck } from "@/components/auth/permission-check";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DocumentConfigurationPage() {
  const jobTitles = await getJobTitles();
  const categories = await getCategories();
  const requirements = await getCertificateRequirements();

  return (
    <PageShell>
      <PageHeader
        heading="Certificate Compliance Manager"
        text="Upload and manage your professional credentials">
        {/* Optional Header Buttons */}
        <PermissionCheck required="add-new-requirement:documents">
          <Link href="/documents-config/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Requirement
            </Button>
          </Link>
        </PermissionCheck>
      </PageHeader>

      <div className="border rounded-lg overflow-hidden w-full">
        <Table className="!w-auto min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">
                Job Title
              </TableHead>
              {categories.categories?.map((cat) => (
                <TableHead
                  key={cat.id}
                  className="text-center min-w-[150px]">
                  {cat.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobTitles.jobTitles?.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium min-w-[200px]">
                  {job.nameEn}
                </TableCell>
                {categories.categories?.map((cat) => {
                  const req = requirements.data?.find(
                    (r: any) =>
                      r.jobTitleId === job.id &&
                      r.documentCategoryId === cat.id,
                  );
                  return (
                    <TableCell key={cat.id} className="text-center min-w-[150px]">
                      <RequirementToggle
                        jobId={job.id}
                        catId={cat.id}
                        initialData={req}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PageShell>
  );
}
