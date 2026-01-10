import { z } from "zod";
import { roleSchema } from "./roles.validation";
import { departmentSchema } from "./departments.validation";

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

const userRoleSchema = roleSchema.pick({
  id: true,
  name: true,
  description: true,
});
const userDepartmentSchema = departmentSchema.pick({ id: true, name: true });

export const userFormSchema = userSchema.extend({
  role: userRoleSchema,
  department: userDepartmentSchema,
});

export type UserFormValues = z.infer<typeof userSchema>;

export type UserFormValuesWithRolesAndDepartments = UserFormValues & {
  role: z.infer<typeof userRoleSchema>;
  department: z.infer<typeof userDepartmentSchema>;
};
