import { z } from "zod";

// Department schema for validation
export const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;
