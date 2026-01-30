"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { hasPermission } from "@/lib/permissions";
import { approveDocument } from "@/actions/documents";

export default function ApproveDocumentButton({
  documentId,
}: {
  documentId: string;
}) {
  const { data: session, status } = useSession();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const userPermissions = session?.user?.permissions || [];
      const canAccess = hasPermission(userPermissions, "approve:document");
      setCanAccess(canAccess);
    }
  }, [session, status]);

  if (!canAccess) {
    return null;
  }

  const handleApprove = async () => {
    console.log("Approve");
    console.log(documentId);
    const res = await approveDocument(documentId);
    if (res?.success) {
      toast({
        title: "Success",
        description: "Document approved",
      });
    } else {
      toast({
        title: "Error",
        description: res?.error,
        variant: "destructive",
      });
      console.error(res);
    }
  };

  return <Button onClick={handleApprove}>Approve Document</Button>;
}
