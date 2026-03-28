import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const nextDay = minutes >= 1440 ? "(+1)" : "";
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}${nextDay}`;
};

export const formatDateDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return dateStr || ""; }
};

export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// Restored functions with optional arguments and null safety
export const formatTimeAgo = (dateStr: string | Date | undefined | null, lang: string = "en"): string => {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return lang === "es" ? "Ahora" : "Just now";
  if (diffInSeconds < 3600) return lang === "es" ? `Hace ${Math.floor(diffInSeconds / 60)}m` : `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return lang === "es" ? `Hace ${Math.floor(diffInSeconds / 3600)}h` : `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-GB");
};

export const translateCountryName = (name: string, lang: string = "es"): string => {
  const map: any = { "Spain": "España", "England": "Inglaterra", "Germany": "Alemania", "France": "Francia", "Italy": "Italia", "Netherlands": "Países Bajos" };
  return lang === "es" ? (map[name] || name) : name;
};
