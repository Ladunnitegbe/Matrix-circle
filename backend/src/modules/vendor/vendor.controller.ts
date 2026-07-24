import { Request, Response } from "express";
import asyncWrapper from "../../common/middleware/async-wrapper";
import * as vendorService from "./vendor.service";

const getMyProfile = asyncWrapper(async (req: Request, res: Response) => {
  const vendor = await vendorService.getProfileByAccountId(req.user!.id);
  res.status(200).json({ success: true, vendor });
});

const getDashboard = asyncWrapper(async (req: Request, res: Response) => {
  const vendor = await vendorService.getProfileByAccountId(req.user!.id);
  const stats = await vendorService.getVendorDashboard(vendor.id);
  res.status(200).json({ success: true, ...stats });
});


export { getMyProfile, getDashboard };