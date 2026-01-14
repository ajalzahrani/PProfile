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
import { deactivatePerson } from "@/actions/persons";
import { JobTitle, Nationality, Person } from "../../../../generated/prisma";

type PersonWithJobTitle = Person & {
  jobTitle: JobTitle;
  nationality: Nationality;
};

export function PersonList({ persons }: { persons: PersonWithJobTitle[] }) {
  const [personToDelete, setPersonToDelete] =
    useState<PersonWithJobTitle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePerson = async () => {
    if (!personToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deactivatePerson(personToDelete.id || "");
      if (result.success) {
        toast({
          title: "Success",
          description: `Person '${personToDelete.firstName} ${personToDelete.lastName}' has been deactivated`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to deactivate person",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deactivating the person",
      });
      console.error(err);
    } finally {
      setIsDeleting(false);
      setPersonToDelete(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {persons.length > 0 ? (
                persons.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      {person.firstName} {person?.secondName} {person.lastName}
                    </TableCell>
                    <TableCell>{person.jobTitle?.nameEn}</TableCell>
                    <TableCell>{person.dob?.toDateString()}</TableCell>
                    <TableCell>
                      {person.isActive ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Link href={`/persons/${person.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Link href={`/persons/${person.id}/edit`}>
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPersonToDelete(person)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!personToDelete}
        onOpenChange={(open) => !open && setPersonToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the person &quot;
              {personToDelete?.firstName} {personToDelete?.lastName}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPersonToDelete(null)}
              disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePerson}
              disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
