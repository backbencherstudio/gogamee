export interface CreateDateManagementData {
  date: string;
  status?: string;
  sportname?: string;
  league?: string;
  package?: string;
  football_standard_package_price?: number;
  football_premium_package_price?: number;
  baskatball_standard_package_price?: number;
  baskatball_premium_package_price?: number;
  updated_football_standard_package_price?: number;
  updated_football_premium_package_price?: number;
  updated_baskatball_standard_package_price?: number;
  updated_baskatball_premium_package_price?: number;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
  duration?: "1" | "2" | "3" | "4" | "5";
}

export interface UpdateDateManagementData {
  status?: string;
  sportname?: string;
  league?: string;
  package?: string;
  football_standard_package_price?: number;
  football_premium_package_price?: number;
  baskatball_standard_package_price?: number;
  baskatball_premium_package_price?: number;
  updated_football_standard_package_price?: number;
  updated_football_premium_package_price?: number;
  updated_baskatball_standard_package_price?: number;
  updated_baskatball_premium_package_price?: number;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
  duration?: "1" | "2" | "3" | "4" | "5";
}

export interface DateManagementFilters {
  status?: string;
  sportname?: string;
  dateFrom?: string;
  dateTo?: string;
  approve_status?: string;
}
