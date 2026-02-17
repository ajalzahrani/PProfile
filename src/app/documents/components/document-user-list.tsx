"use client";

import { userColumns, User } from "./document-user-columns";
import { DocumentUserDataTable } from "./document-user-data-table";

interface DocumentUserListProps {
  users: any[];
  jobtitleRequiredDocuments: any[];
}

export function DocumentUserList({
  users,
  jobtitleRequiredDocuments,
}: DocumentUserListProps) {
  // Transform users data to match the User type
  const tableData: User[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: {
      name: user.role?.name || "",
    },
    department: user.department
      ? {
          name: user.department.name,
        }
      : null,
    documents: user.documents || [],
    compliance: user.compliance || {
      requiredCount: 0,
      uploadedCount: 0,
      validCount: 0,
      isCompliant: false,
      missingCategories: [],
    },
  }));

  return (
    <DocumentUserDataTable columns={userColumns} data={tableData} />
  );
}
