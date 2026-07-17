import { z } from "zod";

export const updateLocationSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
});