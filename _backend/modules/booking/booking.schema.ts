import { z } from "zod";

export const createBookingSchema = z.object({
  selectedSport: z.string().min(1),
  selectedPackage: z.string().min(1),
  selectedCity: z.string().min(1),
  selectedLeague: z.string().min(1),
  adults: z.number().int().min(0),
  kids: z.number().int().min(0),
  babies: z.number().int().min(0),
  departureDate: z.string(),
  returnDate: z.string(),
  departureDateFormatted: z.string(),
  returnDateFormatted: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  totalCost: z.union([z.number(), z.string()]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
