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
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast, useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { PermissionFormValues } from "@/actions/permissions.validation";
import { deletePermission } from "@/actions/permissions";

interface PermissionListProps {
  permissions: PermissionFormValues[];
}

export function PermissionList({ permissions }: PermissionListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] =
    useState<PermissionFormValues | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Group permissions by object (based on code suffix after ":")
  const groupedPermissions = permissions.reduce(
    (groups: Record<string, Permission[]>, permission) => {
      const parts = permission.code.split(":");
      const object =
        parts.length > 1
          ? parts[1][parts[1].length - 1] == "s"
            ? parts[1].slice(0, -1)
            : parts[1]
          : "other";
      if (!groups[object]) {
        groups[object] = [];
      }
      groups[object].push(permission);
      return groups;
    },
    {}
  );

  // Sort categories
  const sortedCategories = Object.keys(groupedPermissions).sort();

  // Handle permission deletion
  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      const result = await deletePermission(permissionToDelete.id || "");

      if (result.success) {
        toast({
          title: "Success",
          description: "Permission deleted successfully",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete permission",
        });
      }
    } catch (err) {
      console.error("Error deleting permission:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "An unexpected error occurred while deleting the permission",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPermissionToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (permission: PermissionFormValues) => {
    setPermissionToDelete(permission);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedPermissions[category].map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">
                      {permission.code}
                    </TableCell>
                    <TableCell>{permission.name}</TableCell>
                    <TableCell>
                      {permission.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            router.push(`/permissions/${permission.id}/edit`)
                          }>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(permission)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the permission &quot;
              {permissionToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
