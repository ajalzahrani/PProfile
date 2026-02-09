import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { DocumentList } from "./components/document-list";
import { getUserComplianceStatus } from "@/actions/document-configs";
import { checkServerPermission } from "@/lib/server-permissions";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { RedirectButton } from "@/components/redirect-button";

export default async function DocumentsPage() {
  await checkServerPermission("manage-compliance:documents");

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userDocuments = await getUserComplianceStatus(session.user.id);

  if (!userDocuments.success && userDocuments.error === "No job title found") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="mx-auto flex max-w-105 flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Unauthorized Access
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Please update your profile first.
          </p>
          <RedirectButton message={"Go to profile"} path={"/user-profile"} />
        </div>
      </div>
    );
  }

  if (userDocuments.data?.length == 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="mx-auto flex max-w-105 flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            No required certificates
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Please inform your HR manager.
          </p>
          {/* <RedirectButton message={"Go to profile"} path={"/user-profile"} /> */}
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

      <DocumentList complianceItems={userDocuments.data} />
    </PageShell>
  );
}
