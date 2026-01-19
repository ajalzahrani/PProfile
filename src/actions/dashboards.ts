"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { checkServerPermission } from "@/lib/server-permissions";
import { getCurrentUser } from "@/lib/auth";

export interface DocumentComplianceDashboardDTO {
  summary: {
    totalRequired: number;
    uploaded: number;
    remaining: number;
    completionPercent: number;
    expired: number;
    valid: number;
  };
  categories: CategoryComplianceDTO[];
  missingCategories: MissingCategoryDTO[];
}

export interface CategoryComplianceDTO {
  categoryId: string;
  categoryName: string;
  isRequired: boolean;
  requiresExpiry: boolean;
  uploaded: boolean;
  documentId?: string;
  expirationDate?: Date | null;
  status?: string | null;
}

export interface MissingCategoryDTO {
  categoryId: string;
  categoryName: string;
}

export async function getAdminDashboardData() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const person = await prisma.person.findUnique({
      where: { userId: user.id },
      select: {
        userId: true,
        jobTitleId: true,
      },
    });

    const now = new Date();

    let uploadedCount = 0;
    let expiredCount = 0;
    let validCount = 0;
    let dashboardDTO: DocumentComplianceDashboardDTO =
      {} as DocumentComplianceDashboardDTO;

    if (person) {
      const requirements = await prisma.certificateRequirement.findMany({
        where: {
          jobTitleId: person.jobTitleId,
        },
        include: {
          documentCategory: true,
        },
      });

      const documents = await prisma.document.findMany({
        where: {
          createdBy: person.userId,
          categoryId: {
            in: requirements.map((r) => r.documentCategoryId),
          },
          isArchived: false,
        },
        include: {
          currentVersion: {
            include: {
              status: true,
            },
          },
          category: true,
        },
      });

      const categories: CategoryComplianceDTO[] = requirements.map((req) => {
        const doc = documents.find(
          (d) => d.categoryId === req.documentCategoryId,
        );

        const expirationDate = doc?.currentVersion?.expirationDate ?? null;
        const isExpired = expirationDate && expirationDate < now;

        if (doc) {
          uploadedCount++;

          if (req.requiresExpiry) {
            isExpired ? expiredCount++ : validCount++;
          } else {
            validCount++;
          }
        }

        return {
          categoryId: req.documentCategoryId,
          categoryName: req.documentCategory.name,
          isRequired: req.isRequired,
          requiresExpiry: req.requiresExpiry,
          uploaded: Boolean(doc),
          documentId: doc?.id,
          expirationDate,
          status: doc?.currentVersion?.status?.name ?? null,
        };
      });

      const missingCategories = categories
        .filter((c) => c.isRequired && !c.uploaded)
        .map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
        }));

      const totalRequired = requirements.filter((r) => r.isRequired).length;
      const remaining = totalRequired - uploadedCount;

      dashboardDTO = {
        summary: {
          totalRequired,
          uploaded: uploadedCount,
          remaining: Math.max(remaining, 0),
          completionPercent:
            totalRequired === 0
              ? 100
              : Math.round((uploadedCount / totalRequired) * 100),
          expired: expiredCount,
          valid: validCount,
        },
        categories,
        missingCategories,
      };
    }

    return {
      success: true,
      dashboardDTO,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to fetch dashboard data",
    };
  }
}

export async function getUserDashboardData() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const totalDocuments = await prisma.document.count({
      where: { versions: { some: { uploadedBy: user.id } } },
    });

    const person = await prisma.person.findUnique({
      where: { userId: user.id },
      select: {
        userId: true,
        jobTitleId: true,
      },
    });

    let data: {
      totalDocuments: number;
      totalRequired: number;
      uploaded: number;
      remaining: number;
    } = {
      totalDocuments: 0,
      totalRequired: 0,
      uploaded: 0,
      remaining: 0,
    };

    if (person) {
      const totalRequired = await prisma.certificateRequirement.count({
        where: {
          jobTitleId: person.jobTitleId,
          isRequired: true,
        },
      });

      const requiredCategories = await prisma.certificateRequirement.findMany({
        where: {
          jobTitleId: person.jobTitleId,
          isRequired: true,
        },
        select: {
          documentCategoryId: true,
        },
      });

      const requiredCategoryIds = requiredCategories.map(
        (r) => r.documentCategoryId,
      );

      const uploaded = await prisma.document.findMany({
        where: {
          createdBy: person.userId,
          categoryId: {
            in: requiredCategoryIds,
          },
          isArchived: false,
        },
        select: {
          categoryId: true,
        },
      });

      // Deduplicate by category
      const uploadedCategoryCount = new Set(uploaded.map((d) => d.categoryId))
        .size;

      const remaining = totalRequired - uploadedCategoryCount;

      data = {
        totalDocuments,
        totalRequired,
        uploaded: uploadedCategoryCount,
        remaining: Math.max(remaining, 0),
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to fetch dashboard data",
    };
  }
}
