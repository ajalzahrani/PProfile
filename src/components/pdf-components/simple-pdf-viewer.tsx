"use client";
import { useState } from "react";

interface SimplePdfViewerProps {
  fileUrl: string;
  className?: string;
}

export function SimplePdfViewer({
  fileUrl,
  className = "",
}: SimplePdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(`Failed to load PDF file: ${fileUrl}`);
    setLoading(false);
  };

  return (
    <div className={`w-full h-full ${className}`}>
      {loading && (
        <div className="flex justify-center items-center h-full bg-gray-50">
          <div className="animate-pulse text-gray-500">Loading PDF...</div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
          <div className="text-red-500">{error}</div>
          <p className="mt-2 text-sm">
            You can try directly{" "}
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline">
              downloading the file
            </a>{" "}
            instead.
          </p>
        </div>
      )}

      <iframe
        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        className={`w-full h-full border-0 ${loading ? "hidden" : "block"}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
