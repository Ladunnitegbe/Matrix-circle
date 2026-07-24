import { Request, Response } from "express";
import asyncWrapper from "../../common/middleware/async-wrapper";
import * as listingService from "./listing.service";

const create = asyncWrapper(async (req: Request, res: Response) => {
  const listing = await listingService.createListing(
    req.user!.id,
    req.body
  );

  return res.status(201).json({
    success: true,
    listing,
  });
});
const feed = asyncWrapper(async (req: Request, res: Response) => {
  const { lat, lng, category, maxDistanceKm } = req.sanitizedQuery as any;
  const listings = await listingService.getFeed({ lat, lng, category, maxDistanceKm });
  return res.status(200).json({ success: true, count: listings.length, listings });
});

const getOne = asyncWrapper(async (req: Request, res: Response) => {
  const listing = await listingService.getListingById(req.params.id as string);
  return res.status(200).json({ success: true, listing });
});

export { create, feed, getOne };