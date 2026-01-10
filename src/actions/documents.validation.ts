import { z } from "zod";

// Document schema for validation
export const documentSchema = z
  .object({
    id: z.string().optional(), // for updates
    title: z.string().min(2, "Title must be at least 2 characters"),
    categoryId: z.string(),
    departmentIds: z.array(z.string()),
    isOrganizationWide: z.boolean(),
    description: z.string().optional(),
    createdBy: z.string().min(1, "Creator is required").optional(),
    tags: z.array(z.string()).optional(), // can be empty or omitted
    isArchived: z.boolean().optional(), // usually defaulted, but allow override
    documentStatus: z.string().optional(),
    changeNote: z.string().optional(),
    expirationDate: z
      .any()
      .optional()
      .transform((val) => {
        if (val === null || val === undefined || val === "") {
          return undefined;
        }
        if (typeof val === "string") {
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }
        if (val instanceof Date) {
          return isNaN(val.getTime()) ? undefined : val;
        }
        return undefined;
      }),
  })
  .refine(
    (data) => {
      // If organization-wide is true, departmentIds can be empty
      // If organization-wide is false, departmentIds must have at least one item
      if (data.isOrganizationWide) {
        return true;
      }
      return data.departmentIds && data.departmentIds.length > 0;
    },
    {
      message:
        "Either select specific departments or enable organization-wide access",
      path: ["departmentIds"],
    }
  );

export type SaveInput = {
  id?: string;
  title: string;
  categoryId?: string;
  description?: string;
  departmentIds: string[];
  isOrganizationWide: boolean;
  tags: string[];
  isArchived: boolean;
  expirationDate: Date | null;
  changeNote?: string;
  documentStatus: string;
  fileName: string;
  fileBuffer: Buffer;
};

export type DocumentFormValues = z.infer<typeof documentSchema>;

// Schema for referring documents to departments
export const referDocumentSchema = z.object({
  documentId: z.string().cuid("Invalid document ID"),
  departmentIds: z
    .array(z.string().cuid("Invalid department ID"))
    .min(1, "At least one department must be selected"),
  message: z.string().optional(),
});

export type ReferDocumentFormValues = z.infer<typeof referDocumentSchema>;

export const updateDocumentScopeSchema = z.object({
  documentId: z.string().cuid("Invalid document ID"),
  departmentIds: z
    .array(z.string().cuid("Invalid department ID"))
    .min(1, "At least one department must be selected"),
});

export const sendDocumentMessageSchema = z.object({
  documentId: z.string().cuid("Invalid document ID"),
  message: z.string().min(1, "Message cannot be empty"),
});

export type SendDocumentMessageInput = z.infer<
  typeof sendDocumentMessageSchema
>;

export type UpdateDocumentScopeFormValues = z.infer<
  typeof updateDocumentScopeSchema
>;

/**
 * Organized file management utilities
 * # Clear File Organization
  - Draft files: Always in draft/ folder
  - Temp files: Temporary files in temp/ folder
  - Signed files: Signed documents in signed/ folder
  - Published files: Published documents in published/ folder
 */

export enum FileType {
  DRAFT = "draft",
  TEMP = "temp",
  SIGNED = "signed",
  PUBLISHED = "published",
}

export enum DeletionType {
  SOFT = "soft", // Mark as deleted but keep files
  HARD = "hard", // Permanently delete everything
  ARCHIVE = "archive", // Move to archive folder
}

export const STATUS_TRANSITIONS = {
  DRAFT: ["REVIEW", "ARCHIVED"],
  REVIEW: ["APPROVED", "UNDER_REVISION", "DECLINED"],
  UNDER_REVISION: ["DRAFT"], // Returns to draft for modifications
  APPROVED: ["PENDING_SIGNATURES", "ARCHIVED"],
  PENDING_SIGNATURES: ["SIGNED", "EXPIRED"],
  SIGNED: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"], // Final state
  // ... other transitions
};
