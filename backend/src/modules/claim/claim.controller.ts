import { Request, Response } from "express";
import asyncWrapper from "../../common/middleware/async-wrapper";
import * as claimService from "./claim.service";

const claim = asyncWrapper(async (req: Request, res: Response) => {
  const listing = await claimService.claimListing(req.user!.id, req.params.id as string);
  res.status(200).json({ success: true, msg: "Listing claimed successfully", listing });
});

const confirmPickup = asyncWrapper(async (req: Request, res: Response) => {
  const listing = await claimService.confirmPickup(req.user!.id, req.params.id as string);
  res.status(200).json({ success: true, msg: "Pickup confirmed", listing });
});

export { claim, confirmPickup };