import { Request, Response } from "express";
import asyncWrapper from "../../common/middleware/async-wrapper";
import * as adminService from "./admin.service";

const approveCharity = asyncWrapper(async (req: Request, res: Response) => {
  const user = await adminService.approveCharityVerification(req.params.userId as string);
  res.status(200).json({ success: true, msg: "Charity verified", user });
});

const getPendingCharities = asyncWrapper(async (req: Request, res: Response) => {
  const charities = await adminService.listPendingCharities();
  res.status(200).json({ success: true, charities });
});

export { approveCharity, getPendingCharities };