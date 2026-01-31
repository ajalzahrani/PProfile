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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { rejectDocument } from "@/actions/documents";

interface RejectDocumentButtonProps {
  documentId: string;
}

export default function RejectDocumentButton({
  documentId,
}: RejectDocumentButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await rejectDocument(documentId, rejectComment);

    if (result.success) {
      toast({
        title: "Document rejected",
        description: "The document has been rejected successfully",
      });
      setOpen(false);
      setRejectComment("");
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to reject document",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <X className="mr-2 h-4 w-4" />
          Reject Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reject Document</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this document. This comment
            will be visible to the document creator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reject-comment">Rejection Comment *</Label>
            <Textarea
              id="reject-comment"
              placeholder="Enter the reason for rejection..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || !rejectComment.trim()}>
            {isSubmitting ? "Rejecting..." : "Reject Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
