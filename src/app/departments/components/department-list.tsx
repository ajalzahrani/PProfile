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
import Link from "next/link";
import { Prisma } from "@prisma/client";
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
import { deleteDepartment } from "@/actions/departments";

// type DepartmentWithRelations = Prisma.DepartmentGetPayload<{}>;
// type DepartmentWithRelations = Prisma.DepartmentGetPayload<{}>;

interface DepartmentListProps {
  departments: any[];
}

export function DepartmentList({ departments }: DepartmentListProps) {
  const [departmentToDelete, setDepartmentToDelete] = useState<any | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteDepartment(departmentToDelete.id);
      if (result.success) {
        toast({
          title: "Success",
          description: `Department '${departmentToDelete.name}' has been deleted`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete department",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the department",
      });
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDepartmentToDelete(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Card>
        <CardHeader>
          <CardTitle>Department Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length > 0 ? (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Link href={`/departments/${department.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Link href={`/departments/${department.id}/edit`}>
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDepartmentToDelete(department)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No departments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!departmentToDelete}
        onOpenChange={(open) => !open && setDepartmentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the department &quot;
              {departmentToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDepartmentToDelete(null)}
              disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDepartment}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
