import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().min(10).max(15),
  password: z.string().min(8),
  role: z.enum(["individual", "charity", "vendor"]),
  name: z.string().min(2),
  charityRegNumber: z.string().min(3).optional(),
  businessName: z.string().min(2).optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});