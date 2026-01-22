"use client";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PdfViewer from "@/components/pdf-components/pdf-viewer";

interface PageParams {
  filePath: string;
}

export default function ReviewPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const router = useRouter();
  const resolvedParams = use(params as Promise<PageParams>);
  const fileUrl = resolvedParams.filePath;
  const decodedPath = decodeURIComponent(fileUrl);
  // return (
  //   <div>
  //     Decoded file: {decodedPath}
  //     Reviewing file: {fileUrl}
  //   </div>
  // );
  // const fileUrl = `/documents/${documentId}`;

  // const fileUrl = currentVersion.filePath;

  console.log("review - filePath: ", fileUrl);

  return (
    <PageShell>
      <PageHeader heading="Review" text="Review document"></PageHeader>

      <Button variant="outline" onClick={router.back} asChild>
        Back
      </Button>

      <PdfViewer fileUrl={decodedPath} />
    </PageShell>
  );
}
