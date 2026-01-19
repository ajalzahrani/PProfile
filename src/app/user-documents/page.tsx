import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { DocumentList } from "./components/document-list";
import { getDocuments, getUserComplianceStatus } from "@/actions/documents";
import { checkServerPermission } from "@/lib/server-permissions";
import { PermissionCheck } from "@/components/auth/permission-check";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { RedirectButton } from "@/components/redirect-button";

export default async function DocumentsPage() {
  await checkServerPermission("manage:compliance-documents");

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const documents = await getDocuments();
  const userDocuments = await getUserComplianceStatus(session.user.id);

  if (userDocuments.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="mx-auto flex max-w-105 flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Unauthorized Access
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Please update your profile first.
          </p>
          <RedirectButton message={"Go to profile"} path={"/person-profile"} />
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      <PageHeader
        heading="Required Certificates"
        text="Upload and manage your professional credentials">
        {/* Optional Header Buttons */}
      </PageHeader>

      <DocumentList complianceItems={userDocuments} />
    </PageShell>
  );
}
