import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { DocumentList } from "./components/document-list";
import { getDocuments } from "@/actions/documents";
import { checkServerPermission } from "@/lib/server-permissions";
import { PermissionCheck } from "@/components/auth/permission-check";

export default async function DocumentsPage() {
  await checkServerPermission("manage:documents");

  const documents = await getDocuments();
  if (!documents.success) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            No documents found
          </h1>
          <p className="mt-4 text-lg text-muted-foreground rounded-md p-4">
            <Link href="/documents/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Document
              </Button>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageShell>
      <PageHeader heading="Documents" text="Manage and track documents">
        <Link href="/documents/new">
          <PermissionCheck required="create:document">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Document
            </Button>
          </PermissionCheck>
        </Link>
      </PageHeader>

      <DocumentList documents={documents.documents || []} />
    </PageShell>
  );
}
