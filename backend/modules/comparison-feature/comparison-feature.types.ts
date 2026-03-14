export interface ComparisonFeatureData {
  category: string;
  standard: string;
  premium: string;
  sortOrder: number;
}

export interface CreateComparisonFeatureData {
  type: "football" | "basketball" | "combined";
  features: ComparisonFeatureData[];
}

export interface UpdateComparisonFeatureData {
  features: ComparisonFeatureData[];
  lastModifiedBy?: string;
}
