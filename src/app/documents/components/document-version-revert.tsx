"use client";
// import { revertDocumentToVersion } from "@/actions/documents";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Undo2 } from "lucide-react";

export function DocumentVersionRevert({
  documentId,
  versionId,
  className,
}: {
  documentId: string;
  versionId: string;
  className?: string;
}) {
  // const [isLoading, setIsLoading] = useState(false);

  // const handleRevert = async () => {
  //   setIsLoading(true);
  //   const result = await revertDocumentToVersion(documentId, versionId);
  //   if (result.success) {
  //     toast({
  //       title: "Success",
  //       description: "Document reverted to version",
  //     });
  //   } else {
  //     toast({
  //       title: "Error",
  //       description: result.error,
  //       variant: "destructive",
  //     });
  //   }
  //   setIsLoading(false);
  // };

  return (
    <div className={className}>
      <Undo2 className="h-4 w-4" />
      {/* <button className={className} onClick={handleRevert}>
        {isLoading ? "Reverting..." : "Revert"}
      </button> */}
    </div>
  );
}
