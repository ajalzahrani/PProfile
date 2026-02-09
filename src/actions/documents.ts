"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  FileType,
  DeletionType,
  STATUS_TRANSITIONS,
} from "./documents.validation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { deleteDocumentFiles } from "./document-delete-actions";
import { saveOrganizedFile } from "./document-file-utils";

/**
 *
 * ### Get all documents for the current user
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
 * ### Get document by ID
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

/**
 * ### Get document user list
 * This function is used to get the list of users who have documents
 */
export async function getDocumentUserList() {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const users = await prisma.user.findMany({
      include: {
        role: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        person: {
          select: {
            id: true,
            jobTitleId: true,
            jobTitle: {
              select: {
                id: true,
                nameEn: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            status: {
              select: {
                name: true,
              },
            },
            currentVersion: {
              select: {
                expirationDate: true,
              },
            },
          },
        },
      },
    });

    // Get all job title required documents
    const jobtitleRequiredDocuments =
      await prisma.certificateRequirement.findMany({
        where: {
          isRequired: true,
          isActive: true,
        },
        select: {
          jobTitleId: true,
          documentCategoryId: true,
          isRequired: true,
          requiresExpiry: true,
        },
      });

    // Calculate compliance for each user
    const usersWithCompliance = users.map((user) => {
      const person = user.person?.[0]; // Get first person record (should be unique)
      const jobTitleId = person?.jobTitleId;

      if (!jobTitleId) {
        return {
          ...user,
          compliance: {
            requiredCount: 0,
            uploadedCount: 0,
            validCount: 0,
            isCompliant: false,
            missingCategories: [],
          },
        };
      }

      // Get required document categories for this user's job title
      const requiredCategories = jobtitleRequiredDocuments
        .filter((req) => req.jobTitleId === jobTitleId)
        .map((req) => req.documentCategoryId);

      const requiredCount = requiredCategories.length;

      // Valid statuses for compliance (exclude expired, rejected, draft, etc.)
      const validStatuses = [
        "APPROVED",
        "PENDING_SIGNATURES",
        "SIGNED",
        "PUBLISHED",
      ];
      const invalidStatuses = ["EXPIRED", "REJECTED", "DRAFT", "DECLINED"];

      // Count uploaded documents in required categories
      const uploadedInRequiredCategories = user.documents.filter((doc) =>
        doc.categoryId ? requiredCategories.includes(doc.categoryId) : false,
      );

      // Count valid documents (not expired and in valid status)
      const now = new Date();
      const validDocuments = uploadedInRequiredCategories.filter((doc) => {
        const statusName = doc.status.name.toUpperCase();
        // Exclude invalid statuses
        if (invalidStatuses.includes(statusName)) {
          return false;
        }
        // Check if status is valid
        const isStatusValid = validStatuses.includes(statusName);
        // Check expiration date if present
        const expirationDate = doc.currentVersion?.expirationDate;
        const isNotExpired =
          !expirationDate || new Date(expirationDate) > now;
        return isStatusValid && isNotExpired;
      });

      const uploadedCount = uploadedInRequiredCategories.length;
      
      // Count unique categories with valid documents (for compliance, we need at least one valid doc per category)
      const validCategoryIds = new Set(
        validDocuments.map((doc) => doc.categoryId).filter(Boolean),
      );
      const validCount = validCategoryIds.size; // Count unique categories with valid documents

      // Find missing categories
      const missingCategories = requiredCategories.filter(
        (catId) => !validCategoryIds.has(catId),
      );

      const isCompliant =
        requiredCount > 0 && validCount === requiredCount && missingCategories.length === 0;

      return {
        ...user,
        compliance: {
          requiredCount,
          uploadedCount,
          validCount,
          isCompliant,
          missingCategories,
        },
      };
    });

    return {
      success: true,
      data: {
        users: usersWithCompliance || [],
        jobtitleRequiredDocuments: jobtitleRequiredDocuments || [],
      },
    };
  } catch (error) {
    console.error("Error fetching document user list:", error);
    return { success: false, error: "Error fetching document user list" };
  }
}

/**
 * ### Change document status
 */
export async function changeDocumentStatus(
  documentId: string,
  currentStatus: string,
  newStatus: string,
  transaction: PrismaClient,
) {
  if (!documentId) {
    throw new Error("Document not found");
  }

  const allowedTransitions =
    STATUS_TRANSITIONS[currentStatus as keyof typeof STATUS_TRANSITIONS] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
    );
  }

  // Update status
  await transaction.document.update({
    where: { id: documentId },
    data: { status: { connect: { name: newStatus } } },
  });
}

/**
 * ### Generate document version with organized file structure
 */
export async function generateDocumentVersionTx(
  documentId: string,
  fileName: string,
  buffer: Buffer,
  hash: string,
  uploaderId: string,
  changeNote: string,
  expirationDate: Date | null,
  documentStatus: string,
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const versionNumber = 1;

      // Use organized file structure
      const { relativePath, error } = await saveOrganizedFile(
        documentId,
        fileName,
        buffer,
        documentStatus,
        versionNumber,
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
 * ### Upload certificate action
 */
export async function saveDocumentAction(prevState: any, formData: FormData) {
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
    const targetUserId = formData.get("targetUserId") as string | null;

    if (!file || !categoryId) {
      return {
        success: false,
        error: "Missing required fields: File or Category",
      };
    }

    // 3. Determine the document owner (creator)
    // If targetUserId is provided, check if user has permission to upload for others
    let documentOwnerId = user.id;
    if (targetUserId && targetUserId !== user.id) {
      // Check if user has permission to upload for others (admin or auditor)
      const canUploadForOthers =
        user.permissions.includes("admin:all") ||
        user.permissions.includes("manage:documents");

      if (!canUploadForOthers) {
        return {
          success: false,
          error: "Unauthorized: You don't have permission to upload documents for other users",
        };
      }

      // Verify target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        return {
          success: false,
          error: "Target user not found",
        };
      }

      documentOwnerId = targetUserId;
    }

    // 4. Prepare Buffer & Hash
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const departmentIds = JSON.parse(departmentIdsRaw || "[]");

    const existing = await prisma.documentVersion.findFirst({
      where: { hash },
      include: { document: true },
    });

    console.log("existing", existing);

    if (existing) {
      return {
        success: false,
        error:
          "Duplicate document detected: This file has already been uploaded.",
        details: {
          documentId: existing.documentId,
          title: existing.document.title,
          versionNumber: existing.versionNumber,
        },
      };
    }

    let documentId: string;

    const newDoc = await prisma.document.create({
      data: {
        title,
        description,
        departments: {
          connect: departmentIds.map((id: string) => ({ id })),
        },
        status: { connect: { name: "DRAFT" } },
        isArchived,
        category: { connect: { id: categoryId } },
        creator: { connect: { id: documentOwnerId } },
      },
    });
    documentId = newDoc.id;

    // 7. Leverage your existing Local File Storage logic
    // Use user.id for uploadedBy (who uploaded it) and documentOwnerId for creator (who owns it)
    const changeNote =
      documentOwnerId === user.id
        ? "Initial Certificate Upload"
        : `Uploaded by ${user.name} on behalf of user`;

    const versionResult = await generateDocumentVersionTx(
      documentId,
      file.name,
      buffer,
      hash,
      user.id, // uploadedBy - tracks who actually uploaded the file
      changeNote,
      expirationDateStr ? new Date(expirationDateStr) : null,
      "DRAFT",
    );

    if (!versionResult.success) {
      // Delete the document files if the version is not created
      await prisma.document.delete({
        where: { id: documentId },
      });
      await deleteDocumentFiles(documentId, DeletionType.HARD);
      return { success: false, error: versionResult.error };
    }

    // 8. Refresh the UI
    revalidatePath("/user-profile");
    revalidatePath("/user-documents");
    if (targetUserId) {
      revalidatePath(`/user-documents/${targetUserId}`);
    }

    return {
      success: true,
      message: "Certificate uploaded and saved locally.",
      documentId,
    };
  } catch (error: any) {
    console.error("Server Action Error:", error);

    // Handle body size limit errors specifically
    const errorMessage =
      error.message || error.toString() || "An unexpected error occurred";
    if (
      errorMessage.toLowerCase().includes("body exceeded") ||
      errorMessage.toLowerCase().includes("5mb") ||
      errorMessage.toLowerCase().includes("body size limit")
    ) {
      return {
        success: false,
        error:
          "File size exceeds the server limit. Maximum file size is 5MB. Please choose a smaller file.",
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * ### Update document action -
 * handles both file upload and expiry date only updates
 */
export async function updateDocumentAction(formData: FormData) {
  try {
    const user = await getCurrentUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const documentId = formData.get("documentId") as string;
    const file = formData.get("file") as File | null;
    const expirationDateStr = formData.get("expirationDate") as string | null;
    const changeNote = formData.get("changeNote") as string | null;

    if (!documentId) {
      return { success: false, error: "Document ID is required" };
    }

    // Check if document exists
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        currentVersion: true,
        status: true,
      },
    });

    if (!existingDocument) {
      return { success: false, error: "Document not found" };
    }

    if (!existingDocument.currentVersion) {
      return { success: false, error: "Document has no current version" };
    }

    const currentVersion = existingDocument.currentVersion;
    const expirationDate = expirationDateStr
      ? new Date(expirationDateStr)
      : null;

    // Check if a file was actually uploaded (not just an empty file input)
    const hasFile = file && file.size > 0;

    // If file is provided, update the current version
    if (hasFile) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const hash = crypto.createHash("sha256").update(buffer).digest("hex");

      // Check if a document version with this hash already exists (across all documents)
      const existingVersionByHash = await prisma.documentVersion.findFirst({
        where: { hash },
        include: { document: true },
      });

      // If hash exists and it's not the current version of this document, return error
      if (
        existingVersionByHash &&
        existingVersionByHash.id !== currentVersion.id
      ) {
        return {
          success: false,
          error:
            "Duplicate document detected: This file has already been uploaded.",
          details: {
            documentId: existingVersionByHash.documentId,
            title: existingVersionByHash.document.title,
            versionNumber: existingVersionByHash.versionNumber,
          },
        };
      }

      // If hash matches current version, just update metadata
      if (currentVersion.hash === hash) {
        // Same file, just update expiration date and change note if provided
        await prisma.documentVersion.update({
          where: { id: currentVersion.id },
          data: {
            ...(expirationDate ? { expirationDate } : {}),
            ...(changeNote ? { changeNote } : {}),
          },
        });

        // Update document status to draft
        await prisma.document.update({
          where: { id: documentId },
          data: { status: { connect: { name: "DRAFT" } } },
        });

        revalidatePath(`/documents/${documentId}`);
        revalidatePath("/documents");
        revalidatePath("/user-documents");

        return {
          success: true,
          message: "Document metadata updated successfully",
          documentId,
        };
      }

      // Different hash - update current version with new file
      const result = await prisma.$transaction(async (tx) => {
        // Use organized file structure
        const { relativePath, error } = await saveOrganizedFile(
          documentId,
          file.name,
          buffer,
          "DRAFT",
          currentVersion.versionNumber,
        );

        if (error || !relativePath) {
          throw new Error(error || "Error saving organized file");
        }

        // Fetch status to use relation object
        const status = await tx.documentStatus.findUnique({
          where: { name: "DRAFT" },
        });

        if (!status) {
          throw new Error("Invalid document status: DRAFT");
        }

        // Update current version instead of creating a new one
        const updatedVersion = await tx.documentVersion.update({
          where: { id: currentVersion.id },
          data: {
            filePath: relativePath,
            fileSize: buffer.length,
            hash: hash,
            uploadedBy: user.id,
            ...(expirationDate ? { expirationDate } : {}),
            ...(changeNote ? { changeNote } : {}),
            statusId: status.id,
          },
        });

        // Update document status to draft
        await tx.document.update({
          where: { id: documentId },
          data: { status: { connect: { name: "DRAFT" } } },
        });

        return { success: true, version: updatedVersion };
      });

      revalidatePath(`/documents/${documentId}`);
      revalidatePath("/documents");
      revalidatePath("/user-documents");

      return {
        success: true,
        message: "Document updated successfully with new file",
        documentId,
      };
    } else {
      // Update only expiry date on current version (no new file uploaded)
      if (expirationDate) {
        // Update current version with new expiration date and optional change note
        await prisma.documentVersion.update({
          where: { id: currentVersion.id },
          data: {
            expirationDate,
            ...(changeNote ? { changeNote } : {}),
          },
        });

        // Update document status to draft
        await prisma.document.update({
          where: { id: documentId },
          data: { status: { connect: { name: "DRAFT" } } },
        });

        revalidatePath(`/documents/${documentId}`);
        revalidatePath("/documents");
        revalidatePath("/user-documents");

        return {
          success: true,
          message: "Expiration date updated successfully",
          documentId,
        };
      } else {
        return {
          success: false,
          error: "Either a file or expiration date must be provided",
        };
      }
    }
  } catch (error: any) {
    console.error("Server Action Error:", error);

    const errorMessage =
      error.message || error.toString() || "An unexpected error occurred";
    if (
      errorMessage.toLowerCase().includes("body exceeded") ||
      errorMessage.toLowerCase().includes("5mb") ||
      errorMessage.toLowerCase().includes("body size limit")
    ) {
      return {
        success: false,
        error:
          "File size exceeds the server limit. Maximum file size is 5MB. Please choose a smaller file.",
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * ### Approve a document
 */
export async function approveDocument(documentId: string) {
  const user = await getCurrentUser();

  if (!user) return { success: false, error: "Unauthorized" };

  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        status: true,
      },
    });

    if (!document) return { success: false, error: "Document not found" };

    if (document.status.name !== "DRAFT")
      return { success: false, error: "Document is not in draft" };

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: { connect: { name: "APPROVED" } },
      },
    });

    await prisma.documentVersion.update({
      where: { id: document.currentVersionId as string },
      data: { status: { connect: { name: "APPROVED" } } },
    });

    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/documents");
    revalidatePath("/user-documents");

    return { success: true, document: updatedDocument };
  } catch (error) {
    console.error("Error approving document:", error);
    return { success: false, error: "Error approving document" };
  }
}

/**
 * ### Reject a document
 */
export async function rejectDocument(
  documentId: string,
  rejectComment: string,
) {
  const user = await getCurrentUser();

  if (!user) return { success: false, error: "Unauthorized" };

  if (!rejectComment || rejectComment.trim().length === 0) {
    return { success: false, error: "Reject comment is required" };
  }

  try {
    // Check if REJECTED status exists
    const rejectedStatus = await prisma.documentStatus.findUnique({
      where: { name: "REJECTED" },
    });

    if (!rejectedStatus) {
      return {
        success: false,
        error:
          "REJECTED status not found in database. Please run the seed script to add it.",
      };
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        status: true,
      },
    });

    if (!document) return { success: false, error: "Document not found" };

    // Allow rejection from DRAFT or REVIEW status
    if (document.status.name !== "DRAFT" && document.status.name !== "REVIEW") {
      return {
        success: false,
        error: "Document can only be rejected from DRAFT or REVIEW status",
      };
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        statusId: rejectedStatus.id,
        rejectComment: rejectComment.trim(),
      },
    });

    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/user-documents");

    return { success: true, document: updatedDocument };
  } catch (error) {
    console.error("Error rejecting document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error rejecting document",
    };
  }
}
