import { prisma } from "@/lib/prisma";
import { RequirementToggle } from "./components/requirement-toggle";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";

export default async function DocumentConfigurationPage() {
  const jobTitles = await prisma.jobTitle.findMany();
  const categories = await prisma.documentCategory.findMany();
  const requirements = await prisma.certificateRequirement.findMany();

  return (
    <PageShell>
      <PageHeader
        heading="Certificate Compliance Manager"
        text="Upload and manage your professional credentials">
        {/* Optional Header Buttons */}
      </PageHeader>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job Title
              </th>
              {categories.map((cat) => (
                <th
                  key={cat.id}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  {cat.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobTitles.map((job) => (
              <tr key={job.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {job.nameEn}
                </td>
                {categories.map((cat) => {
                  const req = requirements.find(
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
