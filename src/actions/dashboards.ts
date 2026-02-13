"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

import {
  DocumentComplianceDashboardDTO,
  CategoryComplianceDTO,
  AdminDashboardDTO,
} from "./dashboards.validation";

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
          (d) => d.categoryId === req.documentCategoryId
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
      compliancePercent: number;
    } = {
      totalDocuments: 0,
      totalRequired: 0,
      uploaded: 0,
      remaining: 0,
      compliancePercent: 0,
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
        (r) => r.documentCategoryId
      );

      const uploadedDocuments = await prisma.document.findMany({
        where: {
          createdBy: person.userId,
          categoryId: {
            in: requiredCategoryIds,
          },
          isArchived: false,
        },
        select: {
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
      });

      // Deduplicate by category
      const uploadedCategoryCount = new Set(
        uploadedDocuments.map((d) => d.categoryId)
      ).size;

      // Compliance percentage is the number of unique categories that have at least one approved certificate
      // that is not expired (if expiration date exists)
      const now = new Date();

      // Group documents by category and check if each category has at least one compliant document
      const compliantCategories = new Set<string>();

      uploadedDocuments.forEach((d) => {
        if (
          d.status?.name === "APPROVED" &&
          (!d.currentVersion?.expirationDate ||
            d.currentVersion.expirationDate > now) &&
          d.categoryId
        ) {
          compliantCategories.add(d.categoryId);
        }
      });

      const compliancePercent = Math.round(
        (compliantCategories.size / totalRequired) * 100
      );
      const remaining = totalRequired - compliantCategories.size;

      data = {
        totalDocuments,
        totalRequired,
        uploaded: uploadedCategoryCount,
        remaining: Math.max(remaining, 0),
        compliancePercent,
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

export async function getAdminDashboardStats() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Summary statistics
    const [
      totalUsers,
      totalDocuments,
      totalPersons,
      totalDepartments,
      totalNotifications,
      activeUsers,
      archivedDocuments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.person.count(),
      prisma.department.count(),
      prisma.notification.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.document.count({
        where: { isArchived: true },
      }),
    ]);

    // User statistics
    const usersByRole = await prisma.user.groupBy({
      by: ["roleId"],
      _count: true,
    });
    const roles = await prisma.role.findMany({
      where: { id: { in: usersByRole.map((u) => u.roleId) } },
    });
    const usersByRoleData = usersByRole.map((u) => ({
      roleName: roles.find((r) => r.id === u.roleId)?.name || "Unknown",
      count: u._count,
    }));

    const usersByDepartment = await prisma.user.groupBy({
      by: ["departmentId"],
      _count: true,
    });
    const departments = await prisma.department.findMany({
      where: { id: { in: usersByDepartment.map((u) => u.departmentId).filter(Boolean) as string[] } },
    });
    const usersByDepartmentData = usersByDepartment
      .filter((u) => u.departmentId)
      .map((u) => ({
        departmentName:
          departments.find((d) => d.id === u.departmentId)?.name || "Unknown",
        count: u._count,
      }));

    // User registration over time (last 30 days)
    const userRegistrations = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });
    const registrationOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        count: userRegistrations.filter(
          (u) => u.createdAt.toISOString().split("T")[0] === dateStr
        ).length,
      };
    });

    // Document statistics
    const documentsByStatus = await prisma.document.groupBy({
      by: ["statusId"],
      _count: true,
    });
    const documentStatuses = await prisma.documentStatus.findMany({
      where: { id: { in: documentsByStatus.map((d) => d.statusId) } },
    });
    const documentsByStatusData = documentsByStatus.map((d) => ({
      statusName:
        documentStatuses.find((s) => s.id === d.statusId)?.name || "Unknown",
      count: d._count,
    }));

    const documentsByCategory = await prisma.document.groupBy({
      by: ["categoryId"],
      _count: true,
    });
    const categories = await prisma.documentCategory.findMany({
      where: { id: { in: documentsByCategory.map((d) => d.categoryId).filter(Boolean) as string[] } },
    });
    const documentsByCategoryData = documentsByCategory
      .filter((d) => d.categoryId)
      .map((d) => ({
        categoryName:
          categories.find((c) => c.id === d.categoryId)?.name || "Unknown",
        count: d._count,
      }));

    // Documents by department (through many-to-many relation)
    const allDocuments = await prisma.document.findMany({
      include: {
        departments: true,
      },
    });
    const departmentDocCounts = new Map<string, number>();
    allDocuments.forEach((doc) => {
      doc.departments.forEach((dept) => {
        departmentDocCounts.set(
          dept.id,
          (departmentDocCounts.get(dept.id) || 0) + 1
        );
      });
    });
    const documentsByDepartmentData = Array.from(departmentDocCounts.entries()).map(
      ([deptId, count]) => ({
        departmentName:
          departments.find((d) => d.id === deptId)?.name || "Unknown",
        count,
      })
    );

    // Document creation over time
    const documentCreations = await prisma.document.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });
    const creationOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        count: documentCreations.filter(
          (d) => d.createdAt.toISOString().split("T")[0] === dateStr
        ).length,
      };
    });

    const archivedVsActive = [
      {
        label: "Active",
        count: totalDocuments - archivedDocuments,
      },
      {
        label: "Archived",
        count: archivedDocuments,
      },
    ];

    // Person statistics
    const personsByGender = await prisma.person.groupBy({
      by: ["gender"],
      _count: true,
    });
    const personsByGenderData = personsByGender.map((p) => ({
      gender: p.gender || "Unknown",
      count: p._count,
    }));

    const personsByNationality = await prisma.person.groupBy({
      by: ["nationalityId"],
      _count: true,
    });
    const nationalities = await prisma.nationality.findMany({
      where: { id: { in: personsByNationality.map((p) => p.nationalityId).filter(Boolean) as string[] } },
    });
    const personsByNationalityData = personsByNationality
      .filter((p) => p.nationalityId)
      .map((p) => ({
        nationalityName:
          nationalities.find((n) => n.id === p.nationalityId)?.nameAr ||
          "Unknown",
        count: p._count,
      }));

    const personsByCitizenship = await prisma.person.groupBy({
      by: ["citizenship"],
      _count: true,
    });
    const personsByCitizenshipData = personsByCitizenship
      .filter((p) => p.citizenship)
      .map((p) => ({
        citizenship: p.citizenship || "Unknown",
        count: p._count,
      }));

    const personsByJobTitle = await prisma.person.groupBy({
      by: ["jobTitleId"],
      _count: true,
    });
    const jobTitles = await prisma.jobTitle.findMany({
      where: { id: { in: personsByJobTitle.map((p) => p.jobTitleId) } },
    });
    const personsByJobTitleData = personsByJobTitle.map((p) => ({
      jobTitleName:
        jobTitles.find((j) => j.id === p.jobTitleId)?.nameEn || "Unknown",
      count: p._count,
    }));

    const personsByRank = await prisma.person.groupBy({
      by: ["rankId"],
      _count: true,
    });
    const ranks = await prisma.rank.findMany({
      where: { id: { in: personsByRank.map((p) => p.rankId).filter(Boolean) as string[] } },
    });
    const personsByRankData = personsByRank
      .filter((p) => p.rankId)
      .map((p) => ({
        rankName: ranks.find((r) => r.id === p.rankId)?.nameAr || "Unknown",
        count: p._count,
      }));

    const personsByUnit = await prisma.person.groupBy({
      by: ["unitId"],
      _count: true,
    });
    const units = await prisma.unit.findMany({
      where: { id: { in: personsByUnit.map((p) => p.unitId).filter(Boolean) as string[] } },
    });
    const personsByUnitData = personsByUnit
      .filter((p) => p.unitId)
      .map((p) => ({
        unitName: units.find((u) => u.id === p.unitId)?.nameAr || "Unknown",
        count: p._count,
      }));

    const activePersons = await prisma.person.count({
      where: { isActive: true },
    });
    const activeVsInactive = [
      {
        label: "Active",
        count: activePersons,
      },
      {
        label: "Inactive",
        count: totalPersons - activePersons,
      },
    ];

    // Document version statistics
    const documentVersions = await prisma.documentVersion.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        fileSize: true,
        statusId: true,
      },
    });

    const versionUploadsOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        count: documentVersions.filter(
          (v) => v.createdAt.toISOString().split("T")[0] === dateStr
        ).length,
      };
    });

    const versionsByStatus = await prisma.documentVersion.groupBy({
      by: ["statusId"],
      _count: true,
    });
    const versionStatuses = await prisma.documentStatus.findMany({
      where: { id: { in: versionsByStatus.map((v) => v.statusId).filter(Boolean) as string[] } },
    });
    const versionsByStatusData = versionsByStatus
      .filter((v) => v.statusId)
      .map((v) => ({
        statusName:
          versionStatuses.find((s) => s.id === v.statusId)?.name || "Unknown",
        count: v._count,
      }));

    const totalFileSize = documentVersions.reduce(
      (sum, v) => sum + v.fileSize,
      0
    );
    const averageFileSize =
      documentVersions.length > 0
        ? Math.round(totalFileSize / documentVersions.length)
        : 0;

    // Notification statistics
    const notificationsByType = await prisma.notification.groupBy({
      by: ["type"],
      _count: true,
    });
    const notificationsByTypeData = notificationsByType.map((n) => ({
      type: n.type,
      count: n._count,
    }));

    const notificationsByChannel = await prisma.notification.groupBy({
      by: ["channel"],
      _count: true,
    });
    const notificationsByChannelData = notificationsByChannel.map((n) => ({
      channel: n.channel,
      count: n._count,
    }));

    const readNotifications = await prisma.notification.count({
      where: { read: true },
    });
    const readVsUnread = [
      {
        label: "Read",
        count: readNotifications,
      },
      {
        label: "Unread",
        count: totalNotifications - readNotifications,
      },
    ];

    const notificationsOverTimeData = await prisma.notification.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });
    const notificationsOverTime = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        count: notificationsOverTimeData.filter(
          (n) => n.createdAt.toISOString().split("T")[0] === dateStr
        ).length,
      };
    });

    // Compliance statistics
    const totalRequiredDocs = await prisma.certificateRequirement.count({
      where: { isRequired: true },
    });
    const uploadedDocs = await prisma.document.count({
      where: { isArchived: false },
    });
    const documentComplianceRate =
      totalRequiredDocs > 0
        ? Math.round((uploadedDocs / totalRequiredDocs) * 100)
        : 0;

    const userActivityRate =
      totalUsers > 0
        ? Math.round((activeUsers / totalUsers) * 100)
        : 0;

    const notificationReadRate =
      totalNotifications > 0
        ? Math.round((readNotifications / totalNotifications) * 100)
        : 0;

    const documentStatusDistribution =
      documentsByStatusData.length > 0
        ? Math.round(100 / documentsByStatusData.length)
        : 0;

    const departmentEngagementRate =
      totalDepartments > 0
        ? Math.round((usersByDepartmentData.length / totalDepartments) * 100)
        : 0;

    const categoryCoverageRate =
      categories.length > 0
        ? Math.round((documentsByCategoryData.length / categories.length) * 100)
        : 0;

    // Department engagement scores
    const allDepts = await prisma.department.findMany();
    const departmentEngagementData = await Promise.all(
      allDepts.map(async (dept) => {
        const deptUsers = await prisma.user.count({
          where: { departmentId: dept.id },
        });
        const deptDocs = await prisma.document.count({
          where: {
            departments: {
              some: { id: dept.id },
            },
          },
        });
        // Get user IDs for this department first, then count notifications
        const deptUserIds = await prisma.user.findMany({
          where: { departmentId: dept.id },
          select: { id: true },
        });
        const deptNotifications = await prisma.notification.count({
          where: {
            userId: {
              in: deptUserIds.map((u) => u.id),
            },
          },
        });

        // Calculate engagement score (normalized 0-100)
        const maxScore = Math.max(deptUsers, deptDocs, deptNotifications, 1);
        const engagementScore = Math.round(
          ((deptUsers + deptDocs + deptNotifications) / (maxScore * 3)) * 100
        );

        return {
          departmentName: dept.name,
          userCount: deptUsers,
          documentCount: deptDocs,
          notificationCount: deptNotifications,
          engagementScore,
        };
      })
    );

    // Category compliance rates
    const allCategories = await prisma.documentCategory.findMany();
    const categoryComplianceData = await Promise.all(
      allCategories.map(async (category) => {
        // Get all job titles that require this category
        const requirements = await prisma.certificateRequirement.findMany({
          where: {
            documentCategoryId: category.id,
            isRequired: true,
          },
          select: {
            jobTitleId: true,
          },
        });

        const requiredJobTitleIds = requirements.map((r) => r.jobTitleId);

        // Count total persons who need this category (persons with these job titles)
        const requiredCount = await prisma.person.count({
          where: {
            jobTitleId: {
              in: requiredJobTitleIds,
            },
            isActive: true,
          },
        });

        // Count documents uploaded for this category
        const uploadedCount = await prisma.document.count({
          where: {
            categoryId: category.id,
            isArchived: false,
          },
        });

        // Calculate compliance rate
        const complianceRate =
          requiredCount > 0
            ? Math.round((uploadedCount / requiredCount) * 100)
            : uploadedCount > 0
              ? 100
              : 0;

        return {
          categoryName: category.name,
          requiredCount,
          uploadedCount,
          complianceRate: Math.min(complianceRate, 100), // Cap at 100%
        };
      })
    );

    // Filter to only show categories with requirements and sort by compliance rate
    const categoryCompliance = categoryComplianceData
      .filter((cat) => cat.requiredCount > 0)
      .sort((a, b) => b.complianceRate - a.complianceRate)
      .slice(0, 10); // Top 10 categories

    const dashboardDTO: AdminDashboardDTO = {
      summary: {
        totalUsers,
        totalDocuments,
        totalPersons,
        totalDepartments,
        totalNotifications,
        activeUsers,
        archivedDocuments,
      },
      users: {
        byRole: usersByRoleData,
        byDepartment: usersByDepartmentData,
        registrationOverTime,
      },
      documents: {
        byStatus: documentsByStatusData,
        byCategory: documentsByCategoryData,
        byDepartment: documentsByDepartmentData,
        creationOverTime,
        archivedVsActive,
      },
      persons: {
        byGender: personsByGenderData,
        byNationality: personsByNationalityData.slice(0, 10), // Top 10
        byCitizenship: personsByCitizenshipData,
        byJobTitle: personsByJobTitleData.slice(0, 10), // Top 10
        byRank: personsByRankData.slice(0, 10), // Top 10
        byUnit: personsByUnitData.slice(0, 10), // Top 10
        activeVsInactive,
      },
      documentVersions: {
        uploadsOverTime: versionUploadsOverTime,
        byStatus: versionsByStatusData,
        totalFileSize,
        averageFileSize,
      },
      notifications: {
        byType: notificationsByTypeData,
        byChannel: notificationsByChannelData,
        readVsUnread,
        notificationsOverTime,
      },
      compliance: {
        documentComplianceRate,
        userActivityRate,
        notificationReadRate,
        documentStatusDistribution,
        departmentEngagement: departmentEngagementRate,
        categoryCoverage: categoryCoverageRate,
      },
      departmentEngagement: departmentEngagementData,
      categoryCompliance,
    };

    return {
      success: true,
      dashboardDTO,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch admin dashboard statistics",
    };
  }
}
