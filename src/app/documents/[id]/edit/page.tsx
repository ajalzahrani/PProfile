"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
// import { SimplePdfViewer } from "../../../../components/pdf-components/simple-pdf-viewer";
import { use } from "react";
import { getDocumentById, updateDocumentAction } from "@/actions/documents";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

interface PageParams {
  id: string;
}

// Submit button component that uses useFormStatus
function SubmitButton({
  fileSelected,
  expirationDate,
}: {
  fileSelected: boolean;
  expirationDate: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending
        ? "Updating..."
        : !fileSelected && expirationDate
        ? "Update Expiration Date"
        : fileSelected
        ? "Upload New Version"
        : "Update Document"}
    </Button>
  );
}

export default function EditDocumentPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = use(params as Promise<PageParams>);
  const documentId = resolvedParams.id;

  const router = useRouter();
  const [document, setDocument] = useState<any>(null);
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [changeNote, setChangeNote] = useState<string>("");
  const [fileSelected, setFileSelected] = useState(false);

  // Create a bound action that includes documentId
  const boundUpdateAction = async (
    prevState: any,
    formData: FormData
  ) => {
    formData.append("documentId", documentId);
    return updateDocumentAction(formData);
  };

  const [state, action] = useActionState(boundUpdateAction, null);

  // Handle file selection change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileSelected(!!file);
  };

  // Handle server action state changes
  useEffect(() => {
    if (state?.success) {
      toast({
        title: "Success",
        description: state.message || "Document updated successfully",
      });
      router.push(`/documents/${documentId}`);
    } else if (state?.success === false && state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, router, documentId]);


  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      const { documents, success, error } = await getDocumentById(documentId);

      if (success && documents) {
        const doc = documents[0];
        setDocument(doc);
        const currentVersion = doc?.currentVersion ?? null;
        if (currentVersion?.expirationDate) {
          const date = new Date(currentVersion.expirationDate);
          setExpirationDate(date.toISOString().split("T")[0]);
        }
        if (currentVersion?.changeNote) {
          setChangeNote(currentVersion.changeNote);
        }
      } else {
        toast({
          title: "Error",
          description: error || "Failed to load document",
          variant: "destructive",
        });
      }
    };

    fetchDocument();
  }, [documentId]);

  if (!document) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center">
        <p>Loading document...</p>
      </div>
    );
  }

  const currentVersion = document?.currentVersion ?? null;
  const categoryId = document.categoryId ?? "";
  const categoryName = document.category?.name ?? "Document";

  return (
    <div className="w-screen min-h-screen">
      {/* Top navigation bar */}
      <div className="bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={"/documents/" + documentId}
            className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
          <h1 className="text-xl font-semibold truncate">Edit Document</h1>
        </div>

        <div className="flex gap-2">
          <Link href={`/documents/${documentId}`}>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex w-full h-[calc(100vh-4rem)]">
        {/* PDF Viewer - Commented out as requested */}
        {/* <div className="w-2/3 border-r border-gray-200">
          {currentVersion?.filePath ? (
            <SimplePdfViewer fileUrl={currentVersion.filePath} className="h-full" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
              <FileQuestion size={64} strokeWidth={1} />
              <p className="mt-4">No document preview available</p>
            </div>
          )}
        </div> */}

        {/* Form - Full width since PDF viewer is commented out */}
        <div className="w-full p-6 overflow-y-auto max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">{document.title}</h2>
              <p className="text-sm text-muted-foreground">
                Category: {categoryName}
              </p>
            </div>

            <form action={action} className="space-y-6">
              {/* Document Upload Form Component */}
              <div className="space-y-4">
                <Label htmlFor="file">Upload New Document (Optional)</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground">
                  {fileSelected
                    ? "New file selected. A new version will be created."
                    : "Leave empty to update only the expiration date without changing the file."}
                </p>
              </div>

              {/* Expiration Date */}
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground">
                  Update the expiration date for this document.
                </p>
              </div>

              {/* Change Note */}
              <div className="space-y-2">
                <Label htmlFor="changeNote">Change Note</Label>
                <Textarea
                  id="changeNote"
                  name="changeNote"
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Enter a note describing the changes made (optional)"
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <SubmitButton
                  fileSelected={fileSelected}
                  expirationDate={expirationDate}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
