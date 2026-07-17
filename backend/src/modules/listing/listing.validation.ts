import { z } from "zod";

export const createListingBodySchema = z.object({
  itemDescription: z.string().min(2),
  quantity: z.number().min(1),
  price: z.union([z.number().min(0), z.literal("free")]).optional().default("free"),
  category: z.enum(["cooked_meal", "baked_goods", "raw_produce", "free_donation"]),
  pickupByTime: z.coerce.date(),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const feedQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  category: z.enum(["cooked_meal", "baked_goods", "raw_produce", "free_donation"]).optional(),
  maxDistanceKm: z.coerce.number().optional().default(5),
});