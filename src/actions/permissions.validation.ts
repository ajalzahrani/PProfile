import { z } from "zod";

// Permission schema for validation
export const permissionSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2, "Code must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PermissionFormValues = z.infer<typeof permissionSchema>;
