"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PenLine } from "lucide-react";

export function DocumentVersionChangeNote({
  changeNote,
  className,
}: {
  changeNote: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleChangeNote = async () => {
    setOpen(true);
  };

  return (
    <div className={className}>
      <button className={className} onClick={handleChangeNote}>
        <PenLine className="h-4 w-4" />
        Change Note
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Note</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <Textarea value={changeNote} readOnly className="min-h-[200px]" />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}
