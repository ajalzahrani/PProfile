import { prisma } from "@/lib/prisma";
import { updateCertificateRequirement } from "@/actions/document-configs";
import { RequirementToggle } from "./components/requirement-toggle";

export default async function DocumentConfigurationPage() {
  const jobTitles = await prisma.jobTitle.findMany();
  const categories = await prisma.documentCategory.findMany();
  const requirements = await prisma.certificateRequirement.findMany();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Certificate Compliance Manager
      </h1>

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
                      r.jobTitleId === job.id && r.documentCategoryId === cat.id
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
    </div>
  );
}
