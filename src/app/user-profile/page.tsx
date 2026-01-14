import { auth } from "@/auth";
import { getUserComplianceStatus } from "@/actions/documents";
import { CertificateUploadForm } from "@/components/CertificateUploadForm";

export default async function ProfilePage() {
  const session = await auth();
  const complianceItems = await getUserComplianceStatus(session?.user?.id!);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">My Credentials</h1>
        <p className="text-gray-600">
          Complete your profile by uploading the required certificates.
        </p>
      </header>

      <div className="grid gap-6">
        {complianceItems.map((item: any) => (
          <div
            key={item.requirement.id}
            className="border rounded-xl p-5 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg">{item.categoryName}</h3>
                {item.requirement.isMandatory && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    Mandatory
                  </span>
                )}
              </div>

              <StatusBadge status={item.status} />
            </div>

            {/* If missing or needs update, show upload form */}
            {item.status === "Missing" || item.status === "Rejected" ? (
              <CertificateUploadForm
                categoryId={item.requirement.documentCategoryId}
                categoryName={item.categoryName}
                requiresExpiry={item.requirement.requiresExpiry}
              />
            ) : (
              <div className="text-sm text-gray-500 flex justify-between">
                <span>File: {item.documentId ? "Uploaded" : "—"}</span>
                {item.expiryDate && (
                  <span>
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Missing: "bg-gray-100 text-gray-600",
    Submitted: "bg-blue-100 text-blue-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
