import { z } from "zod";

export const charityUserIdParamsSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});