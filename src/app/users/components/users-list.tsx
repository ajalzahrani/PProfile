"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { deleteUser } from "@/actions/users";
import { User } from "./users-columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileEdit, Trash2 } from "lucide-react";
import { userColumns } from "./users-columns";
import { UsersDataTable } from "./users-data-table";
import Link from "next/link";

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteUser(userToDelete.id || "");
      if (result.success) {
        toast({
          title: "Success",
          description: `User '${userToDelete.name}' has been deleted`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to delete user",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the user",
      });
      console.error(err);
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  // Transform users data to match the User type
  const tableData: User[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: {
      id: user.role.id,
      name: user.role.name,
    },
    department: user.department
      ? {
          id: user.department.id,
          name: user.department.name,
        }
      : null,
  }));

  // Add delete action to columns
  const columnsWithDelete = userColumns.map((column) => {
    if (column.id === "actions") {
      return {
        ...column,
        cell: ({ row }: any) => {
          const userId = row.original.id;
          if (!userId) return null;

          const user = users.find((u) => u.id === userId);

          return (
            <div className="flex items-center gap-2 justify-end">
              <Link href={`/users/${userId}/edit`}>
                <Button variant="ghost" size="icon">
                  <FileEdit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (user) setUserToDelete(user);
                }}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          );
        },
      };
    }
    return column;
  });

  return (
    <>
      <UsersDataTable columns={columnsWithDelete} data={tableData} />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user &quot;
              {userToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
