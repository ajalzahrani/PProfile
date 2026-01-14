"use client";

import { useFormStatus } from "react-dom";
import { uploadCertificateAction } from "@/actions/documents";
import { useState, useActionState } from "react";

interface Props {
  categoryId: string;
  categoryName: string;
  requiresExpiry: boolean; // Passed from your CertificateRequirement logic
}

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

export function CertificateUploadForm({
  categoryId,
  categoryName,
  requiresExpiry,
}: Props) {
  const [state, action] = useActionState(uploadCertificateAction, null);
  const [fileName, setFileName] = useState<string>("");

  return (
    <div className="border p-4 rounded-lg mb-4 bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-2">{categoryName}</h3>

      <form action={action} className="space-y-4">
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
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
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

        <SubmitButton />

        {/* Feedback Messages */}
        {state?.success && (
          <p className="text-green-600 text-sm">✅ Uploaded successfully!</p>
        )}
        {state?.success === false && (
          <p className="text-red-600 text-sm">❌ Error: {state.error}</p>
        )}
      </form>
    </div>
  );
}
