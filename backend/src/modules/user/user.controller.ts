import { Request, Response } from "express";
import asyncWrapper from "../../common/middleware/async-wrapper";
import * as userService from "./user.service";

const getMyProfile = asyncWrapper(async (req: Request, res: Response) => {
  const user = await userService.getProfileByAccountId(req.user!.id);
  res.status(200).json({ success: true, user });
});

export { getMyProfile };