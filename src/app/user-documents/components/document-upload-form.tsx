"use client";

import { useFormStatus } from "react-dom";
import { uploadCertificateAction } from "@/actions/documents";
import { useState, useActionState, ChangeEvent } from "react";
import { Progress } from "@/components/ui/progress";

interface Props {
  categoryId: string;
  categoryName: string;
  requiresExpiry: boolean; // Passed from your CertificateRequirement logic
}

// Define a constant for your limit (e.g., 5MB)
// const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5000000");

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
      {pending ? "Uploading..." : "Upload Certificate"}
    </button>
  );
}

export function DocumentUploadForm({
  categoryId,
  categoryName,
  requiresExpiry,
}: Props) {
  const [state, action] = useActionState(uploadCertificateAction, null);
  const [fileName, setFileName] = useState<string>("");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setClientError(null); // Reset error on new selection

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setClientError(
          `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max limit is 5MB.`,
        );
        setFileName("");
        e.target.value = ""; // Clear the input
        return;
      }
      setFileName(file.name);
    }
  };

  return (
    <div className=" p-4 mb-4 bg-white ">
      {/* <h3 className="font-semibold text-lg mb-2">{categoryName}</h3> */}

      <form action={action} className="space-y-4">
        <input
          type="hidden"
          name="title"
          value={categoryName + "_" + categoryId}
        />
        <input type="hidden" name="categoryId" value={categoryId} />

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Document (PDF)
          </label>
          <input
            type="file"
            name="file"
            accept=".pdf"
            required
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Conditional Expiry Date */}
        {requiresExpiry && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiration Date
            </label>
            <input
              type="date"
              name="expirationDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        )}

        {/* Show Progress Bar only if there's no client error */}
        {!clientError && <FormStatus progress={state?.success ? 100 : 0} />}

        <SubmitButton />

        {/* Client-side Validation Error */}
        {clientError && (
          <p className="p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
            ⚠️ {clientError}
          </p>
        )}

        {/* Server-side Success Message */}
        {state?.success && (
          <p className="text-green-600 text-sm">✅ Uploaded successfully!</p>
        )}

        {/* Server-side Error Message */}
        {state?.success === false && (
          <p className="text-red-600 text-sm">❌ Error: {state.error}</p>
        )}
      </form>
    </div>
  );
}

// Sub-component to handle internal form status
function FormStatus({ progress }: { progress: number }) {
  const { pending } = useFormStatus();

  if (!pending && progress === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{pending ? "Uploading..." : "Complete"}</span>
        <span>{pending ? "Processing" : "100%"}</span>
      </div>
      {/* If pending, we show an indeterminate-like animation via CSS or a fixed value */}
      <Progress value={pending ? 65 : progress} className="h-2" />
    </div>
  );
}
