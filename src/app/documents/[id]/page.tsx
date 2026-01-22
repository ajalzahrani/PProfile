import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDocumentById } from "@/actions/documents";
import { ChevronLeft, GitCompareArrows, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocumentVersionRevert } from "../components/document-version-revert";
import PdfViewer from "../../../components/pdf-components/pdf-viewer";
import { PermissionCheck } from "@/components/auth/permission-check";
import { getCurrentUser } from "@/lib/auth";
import { DocumentVersionChangeNote } from "../components/document-version-changenote";
import { DeleteDocumentDialog } from "../components/document-delete-dialog";
// import { SimplePdfViewer } from "../../../components/pdf-components/simple-pdf-viewer";

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

  // TODO: Handle signedUrl and filePath for signed and published documents and drafts accordingly.
  const fileUrl = currentVersion.filePath; // currentVersion.filePath;

  return (
    <div className="w-screen min-h-screen">
      {/* Top navigation bar */}
      <div className="bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/user-documents"
            className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Documents
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <PermissionCheck required="delete:document">
            <DeleteDocumentDialog documentId={document.id} />
          </PermissionCheck>
          <PermissionCheck required="create:document">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/documents/${documentId}/edit`}>
                  Edit Document
                </Link>
              </Button>
            </div>
          </PermissionCheck>
        </div>
      </div>

      {/* Main content - Three column layout */}
      <div className="flex w-full h-[calc(100vh-4rem)]">
        {/* PDF Viewer - 2/3 width */}
        <div className="w-2/3 border-r border-border">
          {/* <SimplePdfViewer fileUrl={fileUrl} className="h-full" /> */}
          <PdfViewer fileUrl={fileUrl} />
        </div>

        {/* Document details - 1/3 width */}
        <div className="w-1/3 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">{document.title}</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Created by: {document.creator.name}</p>
                <p>
                  Date:{" "}
                  {new Date(document.createdAt ?? "").toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {document.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Category</h3>
              <p className="text-sm text-muted-foreground">
                {document.category?.name || "No category provided."}
              </p>
            </div>

            {/* <div>
              <h3 className="text-md font-medium mb-2">Document Scope</h3>
              {document.isOrganizationWide ? (
                <p className="text-sm text-muted-foreground">
                  Organization-wide access
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {document.departments.map((d) => d.name).join(", ") ||
                    "No departments provided."}
                </p>
              )}
            </div> */}

            <div>
              <h3 className="text-md font-medium mb-2">Version History</h3>
              <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {document.versions.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    No versions found.
                  </li>
                )}
                {document.versions.map((v) => (
                  <li
                    key={v.id}
                    className={cn(
                      "text-sm border-b border-border p-2",
                      v.id === document.currentVersion?.id && "bg-muted",
                    )}>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        Version {v.versionNumber}{" "}
                        {v.id === document.currentVersion?.id && "(Current)"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploaded by {v.uploader?.name ?? v.uploadedBy}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Date: {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                    {v.status?.name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Status: {v.status?.name}
                      </p>
                    )}
                    {v.expirationDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires on{" "}
                        {new Date(v.expirationDate).toLocaleDateString()}
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <a
                        href={v.filePath}
                        target="_blank"
                        className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Eye className="h-4 w-4" /> Preview
                      </a>
                      <a
                        href={v.filePath}
                        download
                        className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                      {/* FLOW CONDITION: Only show revert button if document is in (review, draft) or document is non-current version*/}
                      {(document.status.name === "REVIEW" ||
                        (document.status.name === "DRAFT" &&
                          v.id !== document.currentVersion?.id)) && (
                        <DocumentVersionRevert
                          documentId={documentId}
                          versionId={v.id}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        />
                      )}
                      {v.id !== document.currentVersion?.id && (
                        <a
                          href={`/documents/${documentId}/compare/${v.id}`}
                          className="text-xs text-primary hover:underline flex items-center gap-1">
                          <GitCompareArrows className="h-4 w-4" />
                          Compare
                        </a>
                      )}
                      {v.changeNote && (
                        <DocumentVersionChangeNote
                          changeNote={v.changeNote}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer asChild"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
