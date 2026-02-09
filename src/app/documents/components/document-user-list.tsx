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
import { Eye, FileEdit, CloudUpload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentUserListProps {
  users: any[];
  jobtitleRequiredDocuments: any[];
}

interface ComplianceInfo {
  requiredCount: number;
  uploadedCount: number;
  validCount: number;
  isCompliant: boolean;
  missingCategories: string[];
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

function getUserDocumentStatus(user: any) {
  const compliance: ComplianceInfo = user.compliance || {
    requiredCount: 0,
    uploadedCount: 0,
    validCount: 0,
    isCompliant: false,
    missingCategories: [],
  };

  const { requiredCount, validCount, uploadedCount, isCompliant } = compliance;

  if (requiredCount === 0) {
    return <Badge variant="secondary">No requirements</Badge>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Badge variant={isCompliant ? "default" : "destructive"}>
          {validCount} / {requiredCount} Certificates
        </Badge>
        {isCompliant ? (
          <Badge
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white">
            ✓ Compliant
          </Badge>
        ) : (
          <Badge variant="destructive">✗ Non-Compliant</Badge>
        )}
      </div>
    </div>
  );
}

export function DocumentUserList({
  users,
  jobtitleRequiredDocuments,
}: DocumentUserListProps) {
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Uploaded Documents</TableHead>
                <TableHead>Profile Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.length > 0 ? (
                users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role.name}</TableCell>
                    <TableCell>{user.department?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CloudUpload className="h-4 w-4" />
                        {user.documents?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>{getUserDocumentStatus(user)}</TableCell>
                    {/* Actions */}
                    <TableCell className="text-right">
                      <Link href={`/user-documents/${user.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon">
                        <Link href={`/users/${user.id}/edit`}>
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No users found xxxx
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
