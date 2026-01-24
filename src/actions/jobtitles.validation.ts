import { z } from "zod";

// JobTitle schema for validation
export const jobTitleSchema = z.object({
  id: z.string().optional(),

  nameEn: z.string().min(2, "Name must be at least 2 characters"),

  nameAr: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional()
    .nullable(),
});

export type JobTitleFormValues = z.infer<typeof jobTitleSchema>;
