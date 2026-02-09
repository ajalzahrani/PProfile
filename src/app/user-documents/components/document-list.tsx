import { DocumentUploadForm } from "./document-upload-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

interface ComplianceItem {
  requirement: {
    id: string;
    documentCategoryId: string;
    isRequired: boolean;
    requiresExpiry: boolean;
  };
  categoryName: string;
  status: string;
  expiryDate?: Date | null;
  documentId?: string;
  filePath?: string; // Ensure your fetcher includes the current version's path
}

interface DocumentListProps {
  complianceItems: ComplianceItem[] | undefined;
}

export function DocumentList({ complianceItems }: DocumentListProps) {
  if (!complianceItems) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {complianceItems.map((item) => (
        <Card key={item.requirement.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">
              {item.categoryName}
            </CardTitle>
            <div className="flex items-center gap-2">
              {item.status === "Missing" && item.requirement.isRequired && (
                <Badge variant="destructive">Required</Badge>
              )}
              {item.status !== "Missing" && (
                <Badge
                  variant={item.status === "Approved" ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              )}
              {item.expiryDate && new Date(item.expiryDate) < new Date() && (
                <Badge variant="destructive">Expired</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 pt-4">
            {item.status === "Missing" || item.status === "Rejected" ? (
              <DocumentUploadForm
                categoryId={item.requirement.documentCategoryId}
                categoryName={item.categoryName}
                requiresExpiry={item.requirement.requiresExpiry}
              />
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {item.status}{" "}
                    {/* {item.expiryDate && (
                      <>
                        {Math.ceil(
                          (new Date(item.expiryDate) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </>
                    )} */}
                  </span>
                </p>
                {item.expiryDate && (
                  <p className="text-xs text-muted-foreground">
                    Expires:{" "}
                    <span className="font-medium text-foreground">
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            )}
          </CardContent>

          {item.documentId && (
            <CardFooter className="border-t pt-4">
              <Link href={`/documents/${item.documentId}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Document
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
