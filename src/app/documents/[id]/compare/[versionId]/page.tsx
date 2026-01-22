import { notFound, redirect } from "next/navigation";
import { getDocumentById } from "@/actions/documents";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import PdfViewer from "@/components/pdf-components/pdf-viewer";
import { BackButton } from "@/components/back-button";
import { getCurrentUser } from "@/lib/auth";

export default async function DocumentComparePage({
  params,
}: {
  params: Promise<{ id: string; versionId: string }>;
}) {
  const { id: documentId, versionId } = await params;

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
  const currentVersion =
    document?.versions.find((v) => v.id === document?.currentVersion?.id) ??
    null;
  const compareVersion =
    document?.versions.find((v) => v.id === versionId) ?? null;

  if (!document || !currentVersion || !compareVersion) {
    notFound();
  }

  // Get file URLs for both versions
  // const currentFileUrl = document.signedUrl ?? currentVersion.filePath;
  const compareFileUrl = compareVersion.filePath;

  return (
    <PageShell>
      <PageHeader
        heading="Compare Documents"
        text={`Comparing current version with version ${compareVersion.versionNumber}`}
      />

      <div className="flex items-center gap-4 mb-6">
        <BackButton />
      </div>

      {/* Side-by-side PDF comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Current Version */}
        <div className="flex flex-col">
          <div className="bg-muted p-3 rounded-t-lg border-b">
            <h3 className="font-semibold text-sm">
              Current Version (v{currentVersion.versionNumber})
            </h3>
            <p className="text-xs text-muted-foreground">
              Uploaded by{" "}
              {currentVersion.uploader?.name || currentVersion.uploadedBy} •
              {new Date(currentVersion.createdAt).toLocaleDateString()}
            </p>
            {currentVersion.changeNote && (
              <p className="text-xs text-muted-foreground mt-1">
                Note: {currentVersion.changeNote}
              </p>
            )}
          </div>
          <div className="flex-1 border rounded-b-lg overflow-hidden">
            {/* <PdfViewer fileUrl={currentFileUrl} /> */}
          </div>
        </div>

        {/* Comparison Version */}
        <div className="flex flex-col">
          <div className="bg-muted p-3 rounded-t-lg border-b">
            <h3 className="font-semibold text-sm">
              Version {compareVersion.versionNumber}
            </h3>
            <p className="text-xs text-muted-foreground">
              Uploaded by{" "}
              {compareVersion.uploader?.name || compareVersion.uploadedBy} •
              {new Date(compareVersion.createdAt).toLocaleDateString()}
            </p>
            {compareVersion.changeNote && (
              <p className="text-xs text-muted-foreground mt-1">
                Note: {compareVersion.changeNote}
              </p>
            )}
          </div>
          <div className="flex-1 border rounded-b-lg overflow-hidden">
            <PdfViewer fileUrl={compareFileUrl} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
