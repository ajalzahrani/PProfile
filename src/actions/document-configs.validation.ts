import { z } from "zod";

// Document config schema for validation
export const documentConfigSchema = z.object({
  id: z.string().optional(),
  jobTitleId: z.string().min(1, "Job Title is required"),
  documentCategoryId: z.string().min(1, "Document Category is required"),
  isRequired: z.boolean(),
  requiresExpiry: z.boolean(),
  isActive: z.boolean(),
});

export type DocumentConfigFormValues = z.infer<typeof documentConfigSchema>;
