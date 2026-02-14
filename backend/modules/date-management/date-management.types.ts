export interface PriceStructure {
  standard: number;
  premium: number;
}

export interface InitDateManagementData {
  date: string;
  duration: "1" | "2" | "3" | "4" | "5";
  sportName: "football" | "basketball" | "combined" | "both";
  league: string;
}

export interface UpdateDateManagementData {
  status?: string;
  duration?: "1" | "2" | "3" | "4" | "5";

  prices?: {
    football?: Partial<PriceStructure>;
    basketball?: Partial<PriceStructure>;
    combined?: Partial<PriceStructure>;
  };

  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;

  // Legacy
  sportName?: string;
  league?: string;
  package?: string;
}

export interface DateManagementFilters {
  months: string[];
  year: number;
  league: string;
  duration: string;
  sportName: string;
}
