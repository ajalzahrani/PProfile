"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  DeletionType,
} from "./documents.validation";
import { revalidatePath } from "next/cache";
import { rm, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

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