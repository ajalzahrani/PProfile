"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0); // default zoom

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${fileUrl.split("/").pop()}.pdf`;
    link.click();
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}>
          ⬅️ Prev
        </button>
        <span style={{ margin: "0 1rem" }}>
          Page {pageNumber} of {numPages}
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
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        <Page pageNumber={pageNumber} scale={scale} />
      </Document>
    </div>
  );
}
