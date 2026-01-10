import { z } from "zod";
import { PermissionFormValues } from "./permissions.validation";

// Role schema for validation
export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

export type RoleFormWithPermissions = RoleFormValues & {
  permissions: PermissionFormValues[];
};
