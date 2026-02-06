"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { deleteDocument } from "@/actions/document-delete-actions";
import { formatDate } from "@/lib/utils";

interface DocumentListProps {
  documents: any[];
}

function getStatusBadge(document: any) {
  const expirationDate = document.currentVersion?.expirationDate;
  const statusName = document.status.name;

  console.log(statusName + " - " + document.id);

  if (statusName.toUpperCase() === "EXPIRED") {
    return <Badge variant="destructive">EXPIRED</Badge>;
  }

  if (expirationDate) {
    if (expirationDate < new Date()) {
      return <Badge variant="destructive">EXPIRED</Badge>;
    }
    return <Badge variant="default">{statusName.toUpperCase()}</Badge>;
  }

  return <Badge variant="default">{statusName.toUpperCase()}</Badge>;
}

export function DocumentList({ documents }: DocumentListProps) {
  const [documentToDelete, setDocumentToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteDocument(documentToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: `Document '${documentToDelete.title}' has been deleted`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete document",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the document",
      });
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
  };

  // TODO: add tanstack table
  return (
    <div className="rounded-md border">
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>{document.title}</TableCell>
                    <TableCell>{document.creator.name}</TableCell>
                    <TableCell>{formatDate(document.createdAt)}</TableCell>
                    <TableCell>{formatDate(document.updatedAt)}</TableCell>
                    <TableCell>
                      {document.currentVersion?.expirationDate
                        ? formatDate(document.currentVersion?.expirationDate)
                        : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(document)}</TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Link href={`/documents/${document.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Link href={`/documents/${document.id}/edit`}>
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDocumentToDelete(document)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No documents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the document &quot;
              {documentToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDocumentToDelete(null)}
              disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
