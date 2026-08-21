import { z } from "zod";

export const listingIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid listing ID format"),
});

export const confirmPickupBodySchema = z.object({
  claimantUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid claimant ID format"),
});