export interface CreateStartingPriceData {
  type: "football" | "basketball" | "combined";
  currency: string;
  category: string;
  standardDescription: string;
  premiumDescription: string;
  pricesByDuration: {
    "1": { standard: number; premium: number };
    "2": { standard: number; premium: number };
    "3": { standard: number; premium: number };
    "4": { standard: number; premium: number };
  };
}

export interface UpdateStartingPriceData {
  currency?: string;
  category?: string;
  standardDescription?: string;
  premiumDescription?: string;
  pricesByDuration?: Partial<{
    "1": { standard: number; premium: number };
    "2": { standard: number; premium: number };
    "3": { standard: number; premium: number };
    "4": { standard: number; premium: number };
  }>;
  isActive?: boolean;
  lastModifiedBy?: string;
}
