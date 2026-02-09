import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { DocumentList } from "../components/document-list";
import { getUserComplianceStatus } from "@/actions/document-configs";
import { getCurrentUser } from "@/lib/auth";
import { RedirectButton } from "@/components/redirect-button";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";

export default async function UserDocumentsPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // Check if user is viewing their own documents OR has permission to view others
  const isViewingOwnDocuments = currentUser.id === userId;
  const canViewOtherUsers = hasPermission(
    currentUser.permissions,
    "manage:documents"
  );

  // If viewing other users' documents, require manage:documents permission
  if (!isViewingOwnDocuments && !canViewOtherUsers) {
    redirect("/unauthorized");
  }

  // If viewing own documents, require manage-compliance:documents permission
  if (isViewingOwnDocuments) {
    const hasCompliancePermission = hasPermission(
      currentUser.permissions,
      "manage-compliance:documents"
    );
    if (!hasCompliancePermission) {
      redirect("/unauthorized");
    }
  }

  const userDocuments = await getUserComplianceStatus(userId);

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
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      <PageHeader
        heading={
          isViewingOwnDocuments
            ? "Required Certificates"
            : "User Compliance Documents"
        }
        text={
          isViewingOwnDocuments
            ? "Upload and manage your professional credentials"
            : "View user's compliance documents"
        }>
        {/* Optional Header Buttons */}
      </PageHeader>

      <DocumentList
        complianceItems={userDocuments.data}
        targetUserId={isViewingOwnDocuments ? undefined : userId}
      />
    </PageShell>
  );
}
