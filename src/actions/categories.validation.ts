import { z } from "zod";

export const documentCategorySchema = z.object({
  id: z.string().cuid().optional(),

  name: z
    .string()
    .min(1, "Category name is required")
    .max(255, "Category name is too long"),

  description: z
    .string()
    .max(1000, "Description is too long")
    .optional()
    .nullable(),

  parentId: z.string().cuid().optional().nullable(),

  createdAt: z.date().optional(),
});

export type DocumentCategoryFormValues = z.infer<typeof documentCategorySchema>;

export const createDocumentCategorySchema = documentCategorySchema.omit({
  id: true,
  createdAt: true,
});

export type CreateDocumentCategoryFormValues = z.infer<
  typeof createDocumentCategorySchema
>;

export const updateDocumentCategorySchema = documentCategorySchema.extend({
  id: z.string().cuid(),
});

export type UpdateDocumentCategoryFormValues = z.infer<
  typeof updateDocumentCategorySchema
>;
