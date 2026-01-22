import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDocumentById } from "@/actions/documents";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PdfViewer from "@/components/pdf-components/pdf-viewer";
import { PermissionCheck } from "@/components/auth/permission-check";
import ButtonApprove from "../../components/button-approve";
import { getCurrentUser } from "@/lib/auth";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const documentId = (await params).id;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const documentResponse = await getDocumentById(documentId);

  // Handle authentication errors
  if (!documentResponse.success) {
    if (documentResponse.error === "Unauthorized") {
      redirect(
        "/login?callbackUrl=" + encodeURIComponent(`/documents/${documentId}`),
      );
    } else {
      notFound();
    }
  }

  const document = documentResponse.documents?.[0];
  console.log({ document });
  const currentVersion = document?.currentVersion ?? null;

  if (!document || !currentVersion) {
    notFound();
  }

  const fileUrl = currentVersion.filePath;

  return (
    <div className="w-screen min-h-screen">
      {/* Top navigation bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/documents"
            className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Documents
          </Link>
        </div>

        <div className="flex gap-2">
          {/* FLOW CONDITION: Only show approve button if user is assigned to the document and has not completed the review*/}
          <PermissionCheck required="edit:document">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/documents/${documentId}/edit`}>Edit Document</Link>
            </Button>
          </PermissionCheck>
        </div>
      </div>

      {/* Main content - Three column layout */}
      <div className="flex w-full h-[calc(100vh-4rem)]">
        {/* PDF Viewer - 2/3 width */}
        <div className="w-2/3 border-r border-gray-200">
          {/* <SimplePdfViewer fileUrl={fileUrl} className="h-full" /> */}
          <PdfViewer fileUrl={fileUrl} />
        </div>

        {/* Document details - 1/3 width */}
        <div className="w-1/3 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{document.title}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Created by: {document.creator.name}</p>
                <p>
                  Date:{" "}
                  {new Date(document.createdAt ?? "").toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* {document.tags && document.tags.length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-md font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-700">
                {document.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Category</h3>
              <p className="text-sm text-gray-700">
                {document.category?.name || "No category provided."}
              </p>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Document Scope</h3>
              {document.isOrganizationWide ? (
                <p className="text-sm text-gray-700">
                  Organization-wide access
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  {document.departments.map((d) => d.name).join(", ") ||
                    "No departments provided."}
                </p>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
