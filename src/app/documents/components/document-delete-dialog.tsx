"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { deleteDocument } from "@/actions/document-delete-actions";
import { Input } from "@/components/ui/input";

interface DeleteDocumentDialogProps {
  documentId: string;
}

export function DeleteDocumentDialog({
  documentId,
}: DeleteDocumentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    if (!confirmDelete) {
      toast({
        title: "Error",
        description: "Please confirm the deletion by typing 'delete'",
      });
      setIsSubmitting(false);
      return;
    }
    const result = await deleteDocument(documentId);
    if (result.success) {
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully",
      });
      router.push("/documents");
    } else {
      toast({
        title: "Error",
        description: "Failed to delete document",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-131.25">
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this document? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Confirm Delete</Label>
            <Input
              type="text"
              placeholder="Type 'delete' to confirm"
              onChange={(e) => setConfirmDelete(e.target.value === "delete")}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleDelete} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "Delete Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
