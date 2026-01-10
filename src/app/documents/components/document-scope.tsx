"use client";

import { useState } from "react";
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
import { FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DepartmentFormValues } from "@/actions/departments.validation";

interface DocumentScopeDialogProps {
  departments: DepartmentFormValues[];
  selectedDepartmentIds: string[];
  setSelectedDepartmentIds: (departmentIds: string[]) => void;
  isOrganizationWide: boolean;
  setIsOrganizationWide: (isOrganizationWide: boolean) => void;
}

export function DocumentScopeDialog({
  departments,
  selectedDepartmentIds,
  setSelectedDepartmentIds,
  isOrganizationWide,
  setIsOrganizationWide,
}: DocumentScopeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleDepartmentChange = (departmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDepartmentIds([...selectedDepartmentIds, departmentId]);
    } else {
      setSelectedDepartmentIds(
        selectedDepartmentIds.filter((id) => id !== departmentId)
      );
    }
  };

  const handleOrganizationWideChange = (checked: boolean) => {
    setIsOrganizationWide(checked);
    if (checked) {
      // Clear selected departments when organization-wide is enabled
      setSelectedDepartmentIds([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FolderTree className="mr-2 h-4 w-4" />
          Document Scope
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Document Scope</DialogTitle>
          <DialogDescription>
            Select departments to include in this document.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {/* Organization-wide option */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organization-wide"
                  checked={isOrganizationWide}
                  onCheckedChange={handleOrganizationWideChange}
                />
                <Label
                  htmlFor="organization-wide"
                  className="cursor-pointer font-medium">
                  Organization-wide access
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Document will be accessible to all departments
              </p>
            </div>

            {/* Departments selection */}
            <div className="space-y-2">
              <Label
                className={isOrganizationWide ? "text-muted-foreground" : ""}>
                Specific Departments
              </Label>
              <div
                className={`border rounded-md p-4 space-y-2 max-h-[200px] overflow-y-auto ${
                  isOrganizationWide ? "opacity-50" : ""
                }`}>
                {departments.map((department) => (
                  <div
                    key={department.id}
                    className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${department.id}`}
                      checked={selectedDepartmentIds.includes(
                        department.id || ""
                      )}
                      disabled={isOrganizationWide}
                      onCheckedChange={(checked) =>
                        handleDepartmentChange(
                          department.id || "",
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`department-${department.id}`}
                      className={`cursor-pointer ${
                        isOrganizationWide ? "text-muted-foreground" : ""
                      }`}>
                      {department.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection summary */}
            <div className="flex items-center text-sm text-muted-foreground">
              {isOrganizationWide ? (
                <div className="flex items-center">
                  <Badge variant="default" className="mr-2">
                    Organization-wide
                  </Badge>
                  <span>All departments have access</span>
                </div>
              ) : selectedDepartmentIds.length > 0 ? (
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">
                    {selectedDepartmentIds.length}
                  </Badge>
                  <span>departments selected</span>
                </div>
              ) : (
                <span className="text-red-500">No departments selected</span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
