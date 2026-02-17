// columns.tsx (client component) will contain our column definitions for users.

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table-components/column-header";

// This type is used to define the shape of our data.
export type User = {
  id?: string;
  name: string | null;
  email: string | null;
  username: string;
  role: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  } | null;
};

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
      <DataTableColumnHeader column={column} title="Display Name" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name || "—"}</div>;
    },
    enableHiding: false,
    filterFn: (row, id, value) => {
      if (!value || value === "") return true;
      const name = row.original.name || "";
      return name.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.username}</div>;
    },
    filterFn: (row, id, value) => {
      if (!value || value === "") return true;
      return row.original.username.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.email || "—"}</div>;
    },
    filterFn: (row, id, value) => {
      if (!value || value === "") return true;
      const email = row.original.email || "";
      return email.toLowerCase().includes(value.toLowerCase());
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const userId = row.original.id;
      if (!userId) return null;
      
      return (
        <div className="flex items-center gap-2 justify-end">
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
