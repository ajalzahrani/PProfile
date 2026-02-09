"use client";

import { useFormStatus } from "react-dom";
import { saveDocumentAction } from "@/actions/documents";
import { useState, useActionState, ChangeEvent, useEffect } from "react";
import type React from "react";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  categoryId: string;
  categoryName: string;
  requiresExpiry: boolean; // Passed from your CertificateRequirement logic
}

// Define a constant for your limit (e.g., 5MB)
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5000000");

// Helper to format file size in MB with 1 decimal place
const formatFileSizeMB = (bytes: number): string => {
  return (bytes / 1024 / 1024).toFixed(1);
};

export function DocumentUploadForm({
  categoryId,
  categoryName,
  requiresExpiry,
}: Props) {
  const [state, action] = useActionState(saveDocumentAction, null);
  const [fileName, setFileName] = useState<string>("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Helper function to format error messages
  const formatError = (error: string): string => {
    if (error.toLowerCase().includes("body exceeded") || error.toLowerCase().includes("5mb")) {
      return `File size exceeds the limit. Maximum file size is ${formatFileSizeMB(MAX_FILE_SIZE)}MB. Please choose a smaller file.`;
    }
    return error;
  };

  // Handle server errors
  useEffect(() => {
    if (state?.success === false && state?.error) {
      setServerError(formatError(state.error));
    } else if (state?.success === true) {
      setServerError(null);
      setClientError(null);
      // Reset file input on success
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
        setFileName("");
      }
    } else {
      // Clear server error when state is reset
      setServerError(null);
    }
  }, [state]);

  // Clear errors when form is submitted
  const handleSubmit = () => {
    setServerError(null);
    setClientError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Force the spinner to show by deferring the heavy work
    setIsProcessing(true);
    setClientError(null);

    // Using requestAnimationFrame ensures the "isProcessing" state
    // is actually painted to the screen before the main thread blocks.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Now do the validation logic
        if (file.size > MAX_FILE_SIZE) {
          setClientError(
            `File is too large (${formatFileSizeMB(file.size)}MB). Max limit is ${formatFileSizeMB(MAX_FILE_SIZE)}MB.`
          );
          e.target.value = "";
          setFileName("");
        } else {
          setFileName(file.name);
        }
        setIsProcessing(false);
      });
    });
  };

  return (
    <form action={action} onSubmit={handleSubmit} className="space-y-4">
      <input
        type="hidden"
        name="title"
        value={categoryName + "_" + categoryId}
      />
      <input type="hidden" name="categoryId" value={categoryId} />

      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="file" className="flex items-center gap-2">
          Document (PDF)
          {isProcessing && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
        </Label>
        <FileInputWrapper>
          <Input
            type="file"
            name="file"
            accept=".pdf"
            required
            onChange={handleFileChange}
          />
        </FileInputWrapper>
        {fileName && (
          <p className="text-sm text-muted-foreground mt-1">
            Selected: {fileName}
          </p>
        )}
      </div>

      {/* Conditional Expiry Date */}
      {requiresExpiry && (
        <div className="space-y-2">
          <Label htmlFor="expirationDate">Expiration Date</Label>
          <Input
            type="date"
            name="expirationDate"
            required
          />
        </div>
      )}

      {/* Show Progress Bar only if there's no client error */}
      {!clientError && <FormStatus progress={state?.success ? 100 : 0} />}

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        <FormStatusButton />
      </Button>

      {/* Client-side Validation Error */}
      {clientError && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>File Size Error:</strong> {clientError}
          </AlertDescription>
        </Alert>
      )}

      {/* Server-side Success Message */}
      {state?.success && (
        <Alert>
          <AlertDescription>✅ Uploaded successfully!</AlertDescription>
        </Alert>
      )}

      {/* Server-side Error Message */}
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Upload Error:</strong> {serverError}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}

// Sub-component to handle internal form status
function FormStatus({ progress }: { progress: number }) {
  const { pending } = useFormStatus();

  if (!pending && progress === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">
          {pending ? "Uploading..." : "Complete"}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {pending ? "Processing" : "100%"}
        </span>
      </div>
      <Progress value={pending ? 65 : progress}>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  );
}

// File input wrapper to handle disabled state during upload
function FileInputWrapper({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <div className={pending ? "opacity-50 pointer-events-none" : ""}>
      {children}
    </div>
  );
}

// Submit button component
function FormStatusButton() {
  const { pending } = useFormStatus();
  return <>{pending ? "Uploading..." : "Upload Certificate"}</>;
}
