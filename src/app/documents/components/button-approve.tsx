"use client";

// import { approveDocument } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ButtonApprove({
  documentId,
  assignmentIds,
}: {
  documentId: string;
  assignmentIds: string[];
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

  // const handleApprove = async () => {
  //   console.log("Approve");
  //   console.log(documentId);
  //   const res = await approveDocument(documentId, assignmentIds);
  //   if (res?.success) {
  //     toast({
  //       title: "Success",
  //       description: "Document approved",
  //     });
  //   } else {
  //     toast({
  //       title: "Error",
  //       description: res?.error,
  //       variant: "destructive",
  //     });
  //     console.error(res);
  //   }
  // };

  return <Button>Approve Document</Button>;
}
