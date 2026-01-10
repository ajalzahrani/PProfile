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
import { Share2 } from "lucide-react";
import { referDocumentToDepartments } from "@/actions/documents";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DepartmentFormValues } from "@/actions/departments.validation";

interface ReferDocumentDialogProps {
  documentId: string | undefined;
  departments: DepartmentFormValues[];
}

export function ReferDocumentDialog({
  documentId,
  departments,
}: ReferDocumentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    []
  );

  const handleDepartmentChange = (departmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartmentIds((prev) => [...prev, departmentId]);
    } else {
      setSelectedDepartmentIds((prev) =>
        prev.filter((id) => id !== departmentId)
      );
    }
  };

  const handleSubmit = async () => {
    if (selectedDepartmentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one department",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await referDocumentToDepartments({
        documentId: documentId || "",
        departmentIds: selectedDepartmentIds,
        message: message.trim() || undefined,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Document referred to ${selectedDepartmentIds.length} department(s)`,
        });
        setOpen(false);
        setMessage("");
        setSelectedDepartmentIds([]);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to refer document",
        });
      }
    } catch (error) {
      console.error("Error referring document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Refer to Departments
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Refer Document to Departments</DialogTitle>
          <DialogDescription>
            Select departments to refer this document to for investigation and
            response.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Departments</Label>
            <div className="border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center space-x-2">
                  <Checkbox
                    id={`department-${department.id}`}
                    checked={selectedDepartmentIds.includes(
                      department.id || ""
                    )}
                    onCheckedChange={(checked) =>
                      handleDepartmentChange(
                        department.id || "",
                        checked as boolean
                      )
                    }
                  />
                  <Label
                    htmlFor={`department-${department.id}`}
                    className="cursor-pointer">
                    {department.name}
                  </Label>
                </div>
              ))}
            </div>

            {selectedDepartmentIds.length > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Badge variant="secondary" className="mr-2">
                  {selectedDepartmentIds.length}
                </Badge>
                <span>departments selected</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              className="min-h-[100px]"
              placeholder="Add any additional context or instructions for the departments..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Referring..." : "Refer Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
