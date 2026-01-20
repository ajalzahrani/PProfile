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
