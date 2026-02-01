import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Country name translations (English to Spanish)
const COUNTRY_TRANSLATIONS: Record<string, string> = {
  England: "Inglaterra",
  Spain: "España",
  Germany: "Alemania",
  Italy: "Italia",
  France: "Francia",
  Netherlands: "Países Bajos",
  Turkey: "Turquía",
  Lithuania: "Lituania",
  Europe: "Europa",
  Portugal: "Portugal",
};

/**
 * Translates country name from English to Spanish
 * @param countryName - Country name in English
 * @returns Country name in Spanish, or original if translation not found
 */
export function translateCountryName(countryName: string): string {
  return COUNTRY_TRANSLATIONS[countryName] || countryName;
}

// Image upload utility function
export const uploadImage = async (
  file: File,
  type: string = "reviews",
): Promise<{ success: boolean; imagePath?: string; error?: string }> => {
  try {
    // File validation
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size too large (max 5MB)" };
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, WebP allowed",
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    // Upload to server
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, imagePath: result.imagePath };
    } else {
      return { success: false, error: result.error || "Upload failed" };
    }
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed. Please try again." };
  }
};

/**
 * Formats a date to "time ago" string (e.g. "2 days ago", "Hace 2 días")
 * @param dateInput - Date string or object
 * @param lang - Language code ('en' or 'es')
 */
export function formatTimeAgo(
  dateInput: string | Date | undefined,
  lang: "en" | "es" = "en",
): string {
  if (!dateInput) return lang === "es" ? "Reciente" : "Recently";

  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Helper for pluralization
  const p = (num: number, label: string, esPlural = "s") => {
    if (lang === "en") return `${num} ${label}${num !== 1 ? "s" : ""} ago`;
    // Spanish
    if (label === "mes" && num !== 1) return `Hace ${num} meses`;
    return `Hace ${num} ${label}${num !== 1 ? esPlural : ""}`;
  };

  const intervals = [
    { label: lang === "es" ? "año" : "year", seconds: 31536000 },
    { label: lang === "es" ? "mes" : "month", seconds: 2592000 },
    { label: lang === "es" ? "día" : "day", seconds: 86400 },
    { label: lang === "es" ? "hora" : "hour", seconds: 3600 },
    { label: lang === "es" ? "minuto" : "minute", seconds: 60 },
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) {
      return p(count, i.label);
    }
  }
  return lang === "es" ? "Hace un momento" : "Just now";
}
