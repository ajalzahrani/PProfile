"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";
import {
  documentSchema,
  updateDocumentScopeSchema,
  type DocumentFormValues,
  type UpdateDocumentScopeFormValues,
  type SaveInput,
  type SendDocumentMessageInput,
  sendDocumentMessageSchema,
  FileType,
  DeletionType,
  STATUS_TRANSITIONS,
} from "./documents.validation";
import { revalidatePath } from "next/cache";
import { rm, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { z } from "zod";
import { writeFile } from "fs";
import { existsSync } from "fs";
import { PrismaClient } from "@prisma/client";

/**
 * Get all documents
 */
export async function getDocuments() {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const isAllowedToViewAllDocuments =
    user?.role === "ADMIN" || user?.role === "QUALITY_ASSURANCE";

  const whereCondition = {
    // ...(isAllowedToViewAllDocuments || !user?.departmentId
    //   ? {}
    //   : {
    //     }),
  };

  try {
    const documents = await prisma.document.findMany({
      where: { ...whereCondition },
      include: {
        versions: true,
        creator: {
          select: {
            name: true,
          },
        },
        status: {
          select: {
            name: true,
          },
        },
        currentVersion: true,
      },
    });

    return { success: true, documents: documents || [] };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return { success: false, error: "Error fetching documents" };
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(documentId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const documents = await prisma.document.findMany({
      where: { id: documentId },
      include: {
        versions: {
          select: {
            id: true,
            versionNumber: true,
            expirationDate: true,
            filePath: true,
            createdAt: true,
            uploadedBy: true,
            changeNote: true,
            status: {
              select: {
                name: true,
              },
            },
            uploader: {
              select: {
                name: true,
              },
            },
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        departments: true,
        currentVersion: true,
        status: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, documents };
  } catch (error) {
    console.error("Error fetching document:", error);
    return { success: false, error: "Error fetching document" };
  }
}

// Add version comparison and rollback capabilities
export async function compareVersions(
  documentId: string,
  version1: number,
  version2: number
) {
  // Implementation for version comparison
}

export async function changeDocumentStatus(
  documentId: string,
  currentStatus: string,
  newStatus: string,
  transaction: PrismaClient
) {
  if (!documentId) {
    throw new Error("Document not found");
  }

  const allowedTransitions =
    STATUS_TRANSITIONS[currentStatus as keyof typeof STATUS_TRANSITIONS] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}`
    );
  }

  // Update status
  await transaction.document.update({
    where: { id: documentId },
    data: { status: { connect: { name: newStatus } } },
  });
}

/**
 * Get organized file path for document
 */
export async function getOrganizedFilePath(
  documentId: string,
  fileName: string,
  fileType: FileType,
  versionNumber?: number
): Promise<{ absolutePath: string; relativePath: string }> {
  const baseDir = path.join(process.cwd(), "public", "uploads", documentId);
  const typeDir = path.join(baseDir, fileType);

  let finalFileName: string;

  switch (fileType) {
    case FileType.DRAFT:
      finalFileName = `v${versionNumber}_${Date.now()}_${fileName}`;
      break;
    case FileType.TEMP:
      finalFileName = `temp_${Date.now()}_${fileName}`;
      break;
    case FileType.SIGNED:
      finalFileName = fileName;
      break;
    case FileType.PUBLISHED:
      finalFileName = `v${versionNumber}_${Date.now()}_${fileName}`;
      break;
    default:
      finalFileName = fileName;
  }

  const absolutePath = path.join(typeDir, finalFileName);
  const relativePath = `/uploads/${documentId}/${fileType}/${finalFileName}`;

  return { absolutePath: absolutePath, relativePath: relativePath };
}

/**
 * Save file with organized structure
 */
export async function saveOrganizedFile(
  documentId: string,
  fileName: string,
  buffer: Buffer,
  fileType: FileType,
  versionNumber?: number
): Promise<{ error?: string; relativePath?: string }> {
  const { absolutePath, relativePath } = await getOrganizedFilePath(
    documentId,
    fileName,
    fileType,
    versionNumber
  );

  try {
    // Create directory if it doesn't exist
    await mkdir(path.dirname(absolutePath), { recursive: true });

    // Write file
    await writeFile(absolutePath, buffer, (err) => {
      if (err) {
        console.error("Error saving organized file:", err);
        return { error: "Error saving organized file: " + err };
      }
    });
  } catch (error) {
    console.error("Error saving organized file:", error);
    return { error: "Error saving organized file: " + error };
  }

  return { relativePath: relativePath };
}

/**
 * Generate document version with organized file structure
 */
export async function generateDocumentVersionTx(
  documentId: string,
  fileName: string,
  buffer: Buffer,
  hash: string,
  uploaderId: string,
  changeNote: string,
  expirationDate: Date | null,
  documentStatus: string
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const latest = await tx.documentVersion.findFirst({
        where: { documentId },
        orderBy: { versionNumber: "desc" },
      });

      const versionNumber = latest ? latest.versionNumber + 1 : 1;

      // Determine file type based on document status
      const fileType =
        documentStatus != "SIGNED" && documentStatus != "PUBLISHED"
          ? FileType.DRAFT
          : documentStatus == "SIGNED"
          ? FileType.SIGNED
          : FileType.PUBLISHED;

      // Use organized file structure
      const { relativePath, error } = await saveOrganizedFile(
        documentId,
        fileName,
        buffer,
        fileType,
        versionNumber
      );

      if (error || !relativePath) {
        return {
          success: false,
          error: error || "Error saving organized file",
          version: null,
        };
      }

      // Fetch status to use relation object
      const status = await tx.documentStatus.findUnique({
        where: { name: documentStatus },
      });

      if (!status) {
        return {
          success: false,
          error: `Invalid document status: ${documentStatus}`,
          version: null,
        };
      }

      const version = await tx.documentVersion.create({
        data: {
          documentId,
          versionNumber,
          changeNote: changeNote || "",
          filePath: relativePath,
          fileSize: buffer.length,
          hash: hash,
          uploadedBy: uploaderId,
          expirationDate,
          statusId: status.id,
        },
      });

      await tx.document.update({
        where: { id: documentId },
        data: { currentVersionId: version.id },
      });

      // Return error if version is not created & deleted file if exists
      if (!version) {
        await deleteDocumentFiles(documentId, DeletionType.HARD);
        return { success: false, error: "Error creating document version" };
      }

      return { success: true, version };
    });

    return { success: true, version: result.version };
  } catch (error) {
    console.error("Error generating document version:", error);
    return {
      success: false,
      error: "Error generating document version: " + error,
      version: null,
    };
  }
}

/**
 * Create new document with version
 */
export async function createDocumentWithVersion(input: SaveInput) {
  const user = await getCurrentUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const {
    id,
    title,
    categoryId,
    description,
    departmentIds,
    isArchived,
    changeNote,
    expirationDate,
    fileName,
    fileBuffer,
    documentStatus,
  } = input;

  console.log("input", input, user);

  // Prevent duplicate by file hash
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Search document by hash if is existed.
  if (!id) {
    const existing = await prisma.documentVersion.findFirst({
      where: { hash },
      include: { document: true },
    });
    if (existing) {
      return {
        success: false,
        error: "Duplicate document detected",
        details: {
          documentId: existing.documentId,
          title: existing.document.title,
          versionNumber: existing.versionNumber,
        },
      };
    }
  }

  // Update document with new version
  if (id) {
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { versions: true },
    });
    if (!doc) return { success: false, error: "Document not found" };
    const already = doc.versions.some((v) => v.hash === hash);
    if (already) return { success: false, error: "File is already uploaded" };

    const updated = await prisma.document.update({
      where: { id },
      data: {
        title,
        description,
        isArchived,
        status: { connect: { name: documentStatus } },
        updatedAt: new Date(),
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    });

    const version = await generateDocumentVersionTx(
      updated.id,
      fileName,
      fileBuffer,
      hash,
      user.id,
      changeNote || "",
      expirationDate,
      documentStatus
    );
    return { success: true, documentId: updated.id, version };
  }

  // Create new document
  const created = await prisma.document.create({
    data: {
      title,
      description,
      departments: { connect: departmentIds.map((d) => ({ id: d })) },
      status: { connect: { name: documentStatus } },
      isArchived,
      creator: { connect: { id: user.id } },
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
    },
  });

  const version = await generateDocumentVersionTx(
    created.id,
    fileName,
    fileBuffer,
    hash,
    user.id,
    changeNote || "",
    expirationDate,
    documentStatus
  );

  if (!version.success) {
    return { success: false, error: version.error };
  }

  return { success: true, documentId: created.id, version };
}

export async function uploadCertificateAction(
  prevState: any,
  formData: FormData
) {
  try {
    // 1. Auth Guard
    const user = await getCurrentUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // 2. Extract Data from FormData
    const file = formData.get("file") as File;
    const categoryId = formData.get("categoryId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const expirationDateStr = formData.get("expirationDate") as string;
    const departmentIdsRaw = formData.get("departmentIds") as string;
    const isArchived = formData.get("isArchived") === "true";

    if (!file || !categoryId) {
      return {
        success: false,
        error: "Missing required fields: File or Category",
      };
    }

    // 3. Prepare Buffer & Hash
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const departmentIds = JSON.parse(departmentIdsRaw || "[]");

    // 4. Find Existing Document (Slot check for this User + Category)
    const existingDoc = await prisma.document.findFirst({
      where: {
        categoryId: categoryId,
        createdBy: user.id,
        isArchived: false,
      },
      include: { versions: true },
    });

    // 5. Check if this exact file was already uploaded to this document
    if (existingDoc?.versions.some((v) => v.hash === hash)) {
      return {
        success: false,
        error:
          "Duplicate document detected: This file has already been uploaded.",
      };
    }

    let documentId: string;

    // 6. Database Transaction / Logic
    if (existingDoc) {
      // SCENARIO: User is updating/renewing an existing certificate
      documentId = existingDoc.id;
      await prisma.document.update({
        where: { id: documentId },
        data: {
          title,
          description,
          updatedAt: new Date(),
          status: { connect: { name: "Submitted" } }, // Reset for Admin review
        },
      });
    } else {
      // SCENARIO: First time upload for this certificate category
      const newDoc = await prisma.document.create({
        data: {
          title,
          description,
          isArchived,
          createdBy: user.id,
          categoryId: categoryId,
          status: { connect: { name: "Submitted" } },
          departments: {
            connect: departmentIds.map((id: string) => ({ id })),
          },
        },
      });
      documentId = newDoc.id;
    }

    // 7. Leverage your existing Local File Storage logic
    const versionResult = await generateDocumentVersionTx(
      documentId,
      file.name,
      buffer,
      hash,
      user.id,
      existingDoc ? "Renewed Certificate" : "Initial Certificate Upload",
      expirationDateStr ? new Date(expirationDateStr) : null,
      "Submitted"
    );

    if (!versionResult.success) {
      return { success: false, error: versionResult.error };
    }

    // 8. Refresh the UI
    revalidatePath("/profile");
    revalidatePath("/documents");

    return {
      success: true,
      message: "Certificate uploaded and saved locally.",
      documentId,
    };
  } catch (error: any) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function getUserComplianceStatus(userId: string) {
  // 1. Get user's job title
  const person = await prisma.person.findFirst({
    where: { userId },
    select: { jobTitleId: true },
  });

  if (!person?.jobTitleId) return [];

  // 2. Get requirements for that job title
  const requirements = await prisma.certificateRequirement.findMany({
    where: { jobTitleId: person.jobTitleId },
    include: { documentCategory: true },
  });

  // 3. Get user's existing documents for these categories
  const userDocs = await prisma.document.findMany({
    where: {
      createdBy: userId,
      categoryId: { in: requirements.map((r) => r.documentCategoryId) },
    },
    include: {
      status: true,
      currentVersion: true,
    },
  });

  // 4. Map them together
  return requirements.map((req: any) => {
    const doc = userDocs.find((d) => d.categoryId === req.documentCategoryId);
    // Add filePath to your mapping in documents.ts -> getUserComplianceStatus
    return {
      requirement: req,
      categoryName: req.documentCategory.name,
      status: doc ? doc.status.name : "Missing",
      expiryDate: doc?.currentVersion?.expirationDate,
      documentId: doc?.id,
      filePath: doc?.currentVersion?.filePath, // Added for direct viewing
    };
  });
}

/**
 * Update a document
 */
export async function updateDocument(
  documentId: string,
  document: DocumentFormValues
) {
  const session = await getServerSession(authOptions);

  const validatedFields = documentSchema.safeParse(document);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: document,
    });

    revalidatePath("/documents");

    return { success: true, document: updatedDocument };
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false, error: "Error updating document" };
  }
}

/**
 * Document deletion utilities with organized file structure support
 */

export interface DeletionResult {
  success: boolean;
  deletedFiles: string[];
  errors: string[];
  totalSizeDeleted: number;
}

/**
 * Enhanced document deletion with comprehensive cleanup
 */
export async function deleteDocument(
  documentId: string,
  deletionType: DeletionType = DeletionType.HARD,
  options: {
    skipFileDeletion?: boolean;
    skipDatabaseDeletion?: boolean;
    logDeletion?: boolean;
  } = {}
): Promise<{
  success: boolean;
  error?: string;
  deletionResult?: DeletionResult;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const {
    skipFileDeletion = false,
    skipDatabaseDeletion = false,
    logDeletion = true,
  } = options;

  try {
    // Get document info before deletion
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        versions: true,
      },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    if (logDeletion) {
      console.log(
        `Starting deletion of document ${documentId} (${document.title})`
      );
      console.log(`Deletion type: ${deletionType}`);
      console.log(`Versions: ${document.versions.length}`);
    }

    let deletionResult: DeletionResult | undefined;

    // Handle file deletion
    if (!skipFileDeletion) {
      deletionResult = await deleteDocumentFiles(documentId, deletionType);

      if (!deletionResult.success) {
        return {
          success: false,
          error: `File deletion failed: ${deletionResult.errors.join(", ")}`,
        };
      }
    }

    // Handle database deletion
    if (!skipDatabaseDeletion) {
      await prisma.$transaction(async (tx) => {
        // Delete related records first
        await tx.documentVersion.deleteMany({
          where: { documentId: document.id },
        });

        // Delete the document
        await tx.document.delete({
          where: { id: documentId },
        });
      });
    }

    if (logDeletion) {
      console.log(`Document ${documentId} deleted successfully`);
      if (deletionResult) {
        console.log(`Files deleted: ${deletionResult.deletedFiles.length}`);
        console.log(
          `Total size freed: ${deletionResult.totalSizeDeleted} bytes`
        );
      }
    }

    revalidatePath("/documents");

    return {
      success: true,
      deletionResult,
    };
  } catch (error) {
    console.error("Error deleting document:", error);
    return {
      success: false,
      error: `Error deleting document: ${error}`,
    };
  }
}

/**
 * Get document file statistics before deletion
 */
export async function getDocumentFileStats(documentId: string): Promise<{
  totalFiles: number;
  totalSize: number;
  fileTypes: Record<string, number>;
  filePaths: string[];
}> {
  const baseDir = path.join(process.cwd(), "public", "uploads", documentId);
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {} as Record<string, number>,
    filePaths: [] as string[],
  };

  if (!existsSync(baseDir)) {
    return stats;
  }

  try {
    const { readdir, stat } = await import("fs/promises");

    // Recursively scan all files
    const scanDirectory = async (dir: string): Promise<void> => {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else {
          const fileStat = await stat(fullPath);
          stats.totalFiles++;
          stats.totalSize += fileStat.size;

          const ext = path.extname(entry.name);
          stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
          stats.filePaths.push(fullPath);
        }
      }
    };

    await scanDirectory(baseDir);
  } catch (error) {
    console.error("Error scanning document files:", error);
  }

  return stats;
}

/**
 * Delete document files with organized structure support
 */
export async function deleteDocumentFiles(
  documentId: string,
  deletionType: DeletionType = DeletionType.HARD
): Promise<DeletionResult> {
  const result: DeletionResult = {
    success: true,
    deletedFiles: [],
    errors: [],
    totalSizeDeleted: 0,
  };

  const baseDir = path.join(process.cwd(), "public", "uploads", documentId);

  if (!existsSync(baseDir)) {
    return result;
  }

  try {
    const { readdir, stat, rm } = await import("fs/promises");

    // Get file statistics before deletion
    const stats = await getDocumentFileStats(documentId);
    console.log(
      `Deleting document ${documentId}: ${stats.totalFiles} files, ${stats.totalSize} bytes`
    );

    if (deletionType === DeletionType.SOFT) {
      // Soft delete: just mark as deleted in database, keep files
      console.log(`Soft delete: Keeping files for document ${documentId}`);
      return result;
    }

    if (deletionType === DeletionType.ARCHIVE) {
      // Archive: move to archive folder
      const archiveDir = path.join(
        process.cwd(),
        "public",
        "archive",
        documentId
      );
      await mkdir(path.dirname(archiveDir), { recursive: true });

      // Move entire directory to archive
      await rm(archiveDir, { recursive: true, force: true });
      await mkdir(archiveDir, { recursive: true });

      // Copy files to archive (simplified - in production use proper move)
      console.log(`Archiving document ${documentId} to ${archiveDir}`);
      return result;
    }

    // Hard delete: permanently remove files
    const deleteFile = async (filePath: string): Promise<void> => {
      try {
        const fileStat = await stat(filePath);
        await rm(filePath, { force: true });
        result.deletedFiles.push(filePath);
        result.totalSizeDeleted += fileStat.size;
      } catch (error) {
        result.errors.push(`Failed to delete ${filePath}: ${error}`);
      }
    };

    // Recursively delete all files
    const deleteDirectory = async (dir: string): Promise<void> => {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await deleteDirectory(fullPath);
        } else {
          await deleteFile(fullPath);
        }
      }

      // Remove empty directory
      try {
        await rm(dir, { recursive: true, force: true });
      } catch (error) {
        // Directory might not be empty, ignore error
      }
    };

    await deleteDirectory(baseDir);

    console.log(
      `Hard delete completed for document ${documentId}: ${result.deletedFiles.length} files deleted`
    );
  } catch (error) {
    result.success = false;
    result.errors.push(`Error deleting document files: ${error}`);
    console.error("Error deleting document files:", error);
  }

  return result;
}

/**
 * Batch delete multiple documents
 */
export async function batchDeleteDocuments(
  documentIds: string[],
  deletionType: DeletionType = DeletionType.HARD
): Promise<{
  success: boolean;
  results: Array<{ documentId: string; success: boolean; error?: string }>;
  summary: { total: number; successful: number; failed: number };
}> {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const documentId of documentIds) {
    try {
      const result = await deleteDocument(documentId, deletionType);
      results.push({
        documentId,
        success: result.success,
        error: result.error,
      });

      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    } catch (error) {
      results.push({
        documentId,
        success: false,
        error: `Batch deletion error: ${error}`,
      });
      failed++;
    }
  }

  return {
    success: failed === 0,
    results,
    summary: {
      total: documentIds.length,
      successful,
      failed,
    },
  };
}

/**
 * Clean up orphaned files (files without corresponding database records)
 */
export async function cleanupOrphanedFiles(): Promise<{
  success: boolean;
  cleanedFiles: string[];
  errors: string[];
}> {
  const result = {
    success: true,
    cleanedFiles: [] as string[],
    errors: [] as string[],
  };

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const { readdir } = await import("fs/promises");

    const documentDirs = await readdir(uploadsDir, { withFileTypes: true });

    for (const dir of documentDirs) {
      if (dir.isDirectory()) {
        const documentId = dir.name;

        // Check if document exists in database
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        });

        if (!document) {
          // Document doesn't exist in database, clean up files
          const dirPath = path.join(uploadsDir, documentId);
          try {
            await rm(dirPath, { recursive: true, force: true });
            result.cleanedFiles.push(dirPath);
            console.log(`Cleaned up orphaned files for document ${documentId}`);
          } catch (error) {
            result.errors.push(`Failed to clean up ${dirPath}: ${error}`);
          }
        }
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Cleanup error: ${error}`);
  }

  return result;
}

/**
 * Revert a document to a specific version
 */

export async function revertDocumentToVersion(
  documentId: string,
  versionId: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const document = await tx.document.findUnique({
        where: { id: documentId },
        include: {
          status: true,
        },
      });

      if (!document) {
        return { success: false, error: "Document not found" };
      }

      // FLOW CONIDTION: if document is not in (review, draft) then abort revert
      if (
        document.status.name !== "REVIEW" &&
        document.status.name !== "DRAFT"
      ) {
        return { success: false, error: "Document is not in review or draft" };
      }

      const version = await tx.documentVersion.findUnique({
        where: { id: versionId },
      });

      if (!version) {
        return { success: false, error: "Version not found" };
      }

      await tx.document.update({
        where: { id: documentId },
        data: {
          currentVersionId: versionId,
        },
      });
    });

    revalidatePath("/documents");

    return { success: true };
  } catch (error) {
    console.error("Error reverting document to version:", error);
    return { success: false, error: "Error reverting document to version" };
  }
}

/**
 * Update document scope
 */
export async function updateDocumentScope(data: UpdateDocumentScopeFormValues) {
  const user = await getCurrentUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const validatedFields = updateDocumentScopeSchema.safeParse(data);

    if (!validatedFields.success) {
      return { success: false, error: "Invalid fields" };
    }

    const { documentId, departmentIds } = validatedFields.data;

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        departments: { connect: departmentIds.map((id) => ({ id })) },
      },
    });

    return { success: true, document: updatedDocument };
  } catch (error) {
    console.error("Error updating document scope:", error);
    return { success: false, error: "Error updating document scope" };
  }
}
