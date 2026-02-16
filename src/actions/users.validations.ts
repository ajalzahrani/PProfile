import { z } from "zod";
import { roleSchema } from "./roles.validation";
import { departmentSchema } from "./departments.validation";

const emptyToNull = (val: unknown) => (val === "" ? null : val);

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.preprocess(
    emptyToNull,
    z
      .string()
      .min(2, "Display Name must be at least 2 characters")
      .nullable(),
  ),
  email: z.preprocess(
    emptyToNull,
    z.string().email("Invalid email address").nullable(),
  ),
  username: z.string().min(2, "Username must be at least 2 characters"),
  password: z.preprocess(
    emptyToNull,
    z
      .string()
      .min(8, "Password must be at least 8 characters")
      .nullable(),
  ),
});

const userRoleSchema = roleSchema.pick({
  id: true,
  name: true,
  description: true,
});
const userDepartmentSchema = departmentSchema
  .pick({ id: true, name: true })
  .nullable();

export const userFormSchema = userSchema.extend({
  role: userRoleSchema,
  department: userDepartmentSchema,
});

export type UserFormValues = {
  id?: string;
  name: string | null;
  email: string | null;
  username: string;
  password: string | null;
};

export type UserFormValuesWithRolesAndDepartments = UserFormValues & {
  role: z.infer<typeof userRoleSchema>;
  department: z.infer<typeof userDepartmentSchema>;
};
