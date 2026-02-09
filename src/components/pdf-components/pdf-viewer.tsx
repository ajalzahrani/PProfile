"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState, useMemo } from "react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Initialize worker - use local worker file (no internet required)
if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  // Use local worker file from public folder
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0); // default zoom
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert file URL to API route if it's an /uploads/ path
  const apiFileUrl = useMemo(() => {
    if (!fileUrl) return fileUrl;

    // If URL is already absolute and contains /uploads/, use API route
    if (fileUrl.includes("/uploads/")) {
      // Extract the path part
      let path = fileUrl;

      // If it's a full URL, extract just the pathname
      if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        try {
          const url = new URL(fileUrl);
          path = url.pathname;
        } catch {
          // If URL parsing fails, try to extract path manually
          const match = fileUrl.match(/\/uploads\/.*$/);
          if (match) path = match[0];
        }
      }

      // Use API route
      if (typeof window !== "undefined") {
        return `${window.location.origin}/api/pdf?path=${encodeURIComponent(path)}`;
      }
      return `/api/pdf?path=${encodeURIComponent(path)}`;
    }

    // For other URLs, use as-is
    return fileUrl;
  }, [fileUrl]);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const handleLoadError = (error: Error) => {
    console.error("PDF load error", error);
    setIsLoading(false);
    setError(`Failed to load PDF: ${error.message}`);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = apiFileUrl;
    link.download = `${fileUrl.split("/").pop()}.pdf`;
    link.click();
  };

  // Memoize options to prevent unnecessary reloads
  const documentOptions = useMemo(
    () => ({
      // Remove cMapUrl to avoid CDN dependency - most PDFs don't need it
      // If needed, you can host cmaps locally and set: cMapUrl: "/cmaps/"
      httpHeaders: {
        "Cache-Control": "no-cache",
      },
    }),
    []
  );

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}>
          ⬅️ Prev
        </button>
        <span style={{ margin: "0 1rem" }}>
          Page {pageNumber} of {numPages ?? "?"}
        </span>
        <button
          onClick={() =>
            setPageNumber((prev) => Math.min(prev + 1, numPages ?? 1))
          }>
          Next ➡️
        </button>

        <button onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}>
          ➖ Zoom Out
        </button>
        <button onClick={() => setScale((prev) => Math.min(prev + 0.1, 2.0))}>
          ➕ Zoom In
        </button>

        <button onClick={handleDownload}>💾 Download</button>
      </div>

      {error && (
        <div style={{ padding: "1rem", color: "red", marginBottom: "1rem" }}>
          {error}
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
            }}
            style={{ marginLeft: "1rem" }}>
            Retry
          </button>
        </div>
      )}

      {isLoading && !error && (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          Loading PDF...
        </div>
      )}

      <Document
        file={apiFileUrl}
        loading={null}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        options={documentOptions}>
        {numPages && <Page pageNumber={pageNumber} scale={scale} />}
      </Document>
    </div>
  );
}
