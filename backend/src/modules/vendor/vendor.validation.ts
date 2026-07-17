import { z } from "zod";

export const vendorRegisterFields = z.object({
  businessName: z.string().min(2),
  coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
});