"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, getCurrentUser } from "@/lib/auth";
import {
  documentSchema,
  referDocumentSchema,
  updateDocumentScopeSchema,
  type DocumentFormValues,
  type ReferDocumentFormValues,
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
    ...(isAllowedToViewAllDocuments || !user?.departmentId
      ? {}
      : {
          assignments: {
            some: {
              departmentId: user.departmentId,
            },
          },
        }),
  };

  try {
    const documents = await prisma.document.findMany({
      where: { ...whereCondition },
      include: {
        assignments: {
          include: {
            department: true,
          },
        },
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
        assignments: {
          select: {
            id: true,
            isCompleted: true,
            departmentId: true,
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
    isOrganizationWide,
    tags,
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
        departments: isOrganizationWide
          ? { set: [] }
          : { set: departmentIds.map((d) => ({ id: d })) },
        isOrganizationWide,
        tags,
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
      isOrganizationWide,
      status: { connect: { name: documentStatus } },
      tags,
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
        assignments: true,
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
      console.log(`Assignments: ${document.assignments.length}`);
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

        await tx.documentAssignment.deleteMany({
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
 * Refer a document to departments
 */
export async function referDocumentToDepartments(
  data: ReferDocumentFormValues
) {
  const user = await getCurrentUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const validatedFields = referDocumentSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Invalid fields " + validatedFields.error.message,
        issues: validatedFields.error.errors,
      };
    }

    const { documentId, departmentIds, message } = validatedFields.data;

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Check if referring to the same department
      for (const departmentId of departmentIds) {
        const existingReferral = await tx.documentAssignment.findFirst({
          where: { documentId, departmentId },
        });

        let referral;
        if (!existingReferral) {
          // Create new referral
          referral = await tx.documentAssignment.create({
            data: {
              documentId,
              departmentId,
              message: message || "",
            },
          });
        }
        // Or you can update ...
      }

      // Update document status to REVIEW when referred to departments
      await tx.document.update({
        where: { id: documentId },
        data: { status: { connect: { name: "REVIEW" } } },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error referring document to departments:", error);
    return { success: false, error: "Error referring document to departments" };
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

/**
 * Document communication
 */

export async function sendDocumentMessage(data: SendDocumentMessageInput) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    const validatedData = sendDocumentMessageSchema.parse(data);

    // check if occurrence status is not closed
    const document = await prisma.document.findUnique({
      where: { id: validatedData.documentId },
      select: {
        status: true,
      },
    });

    if (
      document?.status.name !== "REVIEW" &&
      document?.status.name !== "PARTIAL_APPROVED"
    ) {
      return { success: false, error: "Document is not in review" };
    }

    // Create the message
    const message = await prisma.documentMessage.create({
      data: {
        documentId: validatedData.documentId,
        senderId: user.id,
        recipientDepartmentId: null, // group message
        message: validatedData.message,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user?.departmentId) {
      return { success: false, error: "User not assigned to a department" };
    }

    // Send notifications for the new message
    // await notifyDocumentMessage(
    //   validatedData.documentId,
    //   user.id,
    //   validatedData.message
    // );

    // Get all assigned departments for this document
    // const assignedDepartments = await prisma.documentAssignment.findMany({
    //   where: { documentId: validatedData.documentId },
    //   select: { departmentId: true },
    // });
    // const assignedDepartmentIds = assignedDepartments.map(
    //   (a) => a.departmentId
    // );

    // For each assigned department, check if it has sent at least one message for this document
    // const departmentsWithMessages = await prisma.documentMessage.findMany({
    //   where: {
    //     documentId: validatedData.documentId,
    //     sender: {
    //       departmentId: { in: assignedDepartmentIds },
    //     },
    //   },
    //   select: { sender: { select: { departmentId: true } } },
    // });
    // const departmentsThatAnswered = new Set(
    //   departmentsWithMessages.map((m) => m.sender.departmentId)
    // );

    // if (assignedDepartmentIds.length === 1) {
    //   // Only one department assigned
    //   if (departmentsThatAnswered.has(assignedDepartmentIds[0])) {
    //     await prisma.document.update({
    //       where: { id: validatedData.documentId },
    //       data: { status: { connect: { name: "ANSWERED" } } },
    //     });
    //   }
    // } else if (assignedDepartmentIds.length > 1) {
    //   // More than one department assigned
    //   if (departmentsThatAnswered.size < assignedDepartmentIds.length) {
    //     await prisma.document.update({
    //       where: { id: validatedData.documentId },
    //       data: { status: { connect: { name: "ANSWERED_PARTIALLY" } } },
    //     });
    //   } else {
    //     await prisma.document.update({
    //       where: { id: validatedData.documentId },
    //       data: { status: { connect: { name: "ANSWERED" } } },
    //     });
    //   }
    // }

    revalidatePath(`/documents/${validatedData.documentId}`);
    return { success: true, message };
  } catch (error) {
    console.error("Error sending document message:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.errors,
      };
    }
    return { success: false, error: "Failed to send message" };
  }
}

export async function getDocumentMessages(documentId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    // Only show messages to users involved in the occurrence (QA or assigned departments)
    // (Assume QA role is 'QUALITY_ASSURANCE')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { departmentId: true, role: { select: { name: true } } },
    });
    if (!user) return { success: false, error: "User not found" };
    // Check if user is QA or assigned department
    let isAllowed = false;
    if (user.role.name === "QUALITY_ASSURANCE" || user.role.name === "ADMIN") {
      isAllowed = true;
    } else if (user.departmentId) {
      const assignment = await prisma.documentAssignment.findFirst({
        where: { documentId, departmentId: user.departmentId },
      });
      if (assignment) isAllowed = true;
    }
    if (!isAllowed) return { success: false, error: "Not authorized" };
    // Fetch all group messages for this occurrence
    const messages = await prisma.documentMessage.findMany({
      where: { documentId, recipientDepartmentId: null },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, messages };
  } catch (error) {
    console.error("Error getting document messages:", error);
    return { success: false, error: "Failed to get document messages" };
  }
}

/**
 * Approve a document
 */
export async function approveDocument(
  documentId: string,
  assignmentId: string[]
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Make sure all assigned departments have completed the reivew and approve
    await prisma.$transaction(async (tx) => {
      // Find the current document & current document version
      const document = await tx.document.findFirst({
        where: { id: documentId },
        select: { currentVersionId: true },
      });

      if (!document || !document.currentVersionId) {
        return { success: false, error: "Document not found" };
      }

      // Find Unique assignmentId by user departmentId
      const assignment = await tx.documentAssignment.findFirst({
        where: { documentId, departmentId: user.departmentId },
      });

      if (!assignment) {
        return { success: false, error: "Assignment not found" };
      }

      // Update current assignment to completed
      await tx.documentAssignment.update({
        where: { id: assignment.id },
        data: { isCompleted: true, completedAt: new Date() },
      });

      // Check if all assignments are completed
      const assignments = await tx.documentAssignment.findMany({
        where: { documentId, isCompleted: false },
        select: { isCompleted: true },
      });

      // If all departments have completed the review and approve, update the document status to APPROVED, or update document to partial_approved if some approve it. also update current version to same state.
      if (assignments.length === 0) {
        await tx.document.update({
          where: { id: documentId },
          data: { status: { connect: { name: "APPROVED" } } },
        });
        await tx.documentVersion.update({
          where: { id: document.currentVersionId },
          data: { status: { connect: { name: "APPROVED" } } },
        });
        return { success: true, message: "Document approved" };
      } else {
        await tx.document.update({
          where: { id: documentId },
          data: { status: { connect: { name: "PARTIAL_APPROVED" } } },
        });
        await tx.documentVersion.update({
          where: { id: document.currentVersionId },
          data: { status: { connect: { name: "PARTIAL_APPROVED" } } },
        });
        return { success: true, message: "Document approved" };
      }

      return {
        success: false,
        error: "Not all departments have completed the review and approve",
      };
    });
    return { success: true, message: "Document approved" };
  } catch (error) {
    console.error("Error approving document:", error);
    return { success: false, error: "Error approving document: " + error };
  }
}
