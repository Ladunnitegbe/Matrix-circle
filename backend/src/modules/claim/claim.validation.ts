import { z } from "zod";

export const listingIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const confirmPickupBodySchema = z.object({
  claimantUserId: z.string().min(1),
});