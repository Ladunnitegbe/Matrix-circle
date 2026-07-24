import { z } from "zod";

export const listingIdParamsSchema = z.object({
  id: z.string().min(1),
});