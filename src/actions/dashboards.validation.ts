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

// Admin Dashboard DTO
export interface AdminDashboardDTO {
  // Summary statistics
  summary: {
    totalUsers: number;
    totalDocuments: number;
    totalPersons: number;
    totalDepartments: number;
    totalNotifications: number;
    activeUsers: number;
    archivedDocuments: number;
  };

  // User statistics
  users: {
    byRole: Array<{ roleName: string; count: number }>;
    byDepartment: Array<{ departmentName: string; count: number }>;
    registrationOverTime: Array<{ date: string; count: number }>;
  };

  // Document statistics
  documents: {
    byStatus: Array<{ statusName: string; count: number }>;
    byCategory: Array<{ categoryName: string; count: number }>;
    byDepartment: Array<{ departmentName: string; count: number }>;
    creationOverTime: Array<{ date: string; count: number }>;
    archivedVsActive: Array<{ label: string; count: number }>;
  };

  // Person statistics
  persons: {
    byGender: Array<{ gender: string; count: number }>;
    byNationality: Array<{ nationalityName: string; count: number }>;
    byCitizenship: Array<{ citizenship: string; count: number }>;
    byJobTitle: Array<{ jobTitleName: string; count: number }>;
    byRank: Array<{ rankName: string; count: number }>;
    byUnit: Array<{ unitName: string; count: number }>;
    activeVsInactive: Array<{ label: string; count: number }>;
  };

  // Document version statistics
  documentVersions: {
    uploadsOverTime: Array<{ date: string; count: number }>;
    byStatus: Array<{ statusName: string; count: number }>;
    totalFileSize: number;
    averageFileSize: number;
  };

  // Notification statistics
  notifications: {
    byType: Array<{ type: string; count: number }>;
    byChannel: Array<{ channel: string; count: number }>;
    readVsUnread: Array<{ label: string; count: number }>;
    notificationsOverTime: Array<{ date: string; count: number }>;
  };

  // Compliance statistics (for radar chart)
  compliance: {
    documentComplianceRate: number;
    userActivityRate: number;
    notificationReadRate: number;
    documentStatusDistribution: number;
    departmentEngagement: number;
    categoryCoverage: number;
  };

  // Department engagement (for radar chart)
  departmentEngagement: Array<{
    departmentName: string;
    userCount: number;
    documentCount: number;
    notificationCount: number;
    engagementScore: number;
  }>;

  // Category compliance rates (for radar chart)
  categoryCompliance: Array<{
    categoryName: string;
    requiredCount: number;
    uploadedCount: number;
    complianceRate: number;
  }>;
}
