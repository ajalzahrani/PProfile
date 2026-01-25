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

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job Title
              </th>
              {categories.categories?.map((cat) => (
                <th
                  key={cat.id}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  {cat.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobTitles.jobTitles?.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {job.nameEn}
                </td>
                {categories.categories?.map((cat) => {
                  const req = requirements.data?.find(
                    (r: any) =>
                      r.jobTitleId === job.id &&
                      r.documentCategoryId === cat.id,
                  );
                  return (
                    <td key={cat.id} className="px-6 py-4 text-center">
                      <RequirementToggle
                        jobId={job.id}
                        catId={cat.id}
                        initialData={req}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
