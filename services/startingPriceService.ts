import axiosClient from "../lib/axiosClient";

export interface StartingPriceData {
  type: "football" | "basketball" | "combined";
  features: string[];
  pricesByDuration: {
    "1": { standard: number; premium: number };
    "2": { standard: number; premium: number };
    "3": { standard: number; premium: number };
    "4": { standard: number; premium: number };
  };
  currency: string;
}

export const getStartingPriceByType = async (
  type: string,
): Promise<StartingPriceData | null> => {
  try {
    const response = await axiosClient.get(`/api/starting-price/${type}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching starting price for ${type}:`, error);
    return null;
  }
};
