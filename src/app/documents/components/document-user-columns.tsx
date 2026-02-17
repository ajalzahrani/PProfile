// columns.tsx (client component) will contain our column definitions for users.

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileEdit, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table-components/column-header";

// This type is used to define the shape of our data.
export type User = {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
  department?: {
    name: string;
  } | null;
  documents?: Array<{
    id: string;
    title: string;
    categoryId: string | null;
    status: {
      name: string;
    };
    currentVersion?: {
      expirationDate: Date | null;
    } | null;
  }>;
  compliance?: {
    requiredCount: number;
    uploadedCount: number;
    validCount: number;
    isCompliant: boolean;
    missingCategories: string[];
  };
};

function getUserDocumentStatus(user: User) {
  const compliance = user.compliance || {
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

export const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>;
    },
    enableHiding: false,
    filterFn: (row, id, value) => {
      if (!value || value === "") return true;
      return row.original.name.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.email}</div>;
    },
    filterFn: (row, id, value) => {
      if (!value || value === "") return true;
      return row.original.email.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.role.name}</div>;
    },
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true;
      return row.original.role.name.toLowerCase() === value.toLowerCase();
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.department?.name || "—"}</div>;
    },
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true;
      const deptName = row.original.department?.name || "";
      return deptName.toLowerCase() === value.toLowerCase();
    },
  },
  {
    accessorKey: "documents",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploaded Documents" />
    ),
    cell: ({ row }) => {
      const documentCount = row.original.documents?.length || 0;
      return (
        <div className="flex items-center gap-2">
          <CloudUpload className="h-4 w-4" />
          {documentCount}
        </div>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const countA = rowA.original.documents?.length || 0;
      const countB = rowB.original.documents?.length || 0;
      return countA - countB;
    },
  },
  {
    accessorKey: "compliance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Profile Status" />
    ),
    cell: ({ row }) => {
      return getUserDocumentStatus(row.original);
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const compliantA = rowA.original.compliance?.isCompliant ? 1 : 0;
      const compliantB = rowB.original.compliance?.isCompliant ? 1 : 0;
      return compliantA - compliantB;
    },
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      const isCompliant = row.original.compliance?.isCompliant || false;
      if (value === "compliant") return isCompliant;
      if (value === "non-compliant") return !isCompliant;
      return true;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const userId = row.original.id;
      return (
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/user-documents/${userId}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
          </Link>
          <Link href={`/users/${userId}/edit`}>
            <Button variant="ghost" size="icon">
              <FileEdit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          </Link>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
