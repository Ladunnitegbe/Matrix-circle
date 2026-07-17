import { Request, Response } from "express";
import * as authService from "./auth.service";
import asyncWrapper from "../../common/middleware/async-wrapper";

const register = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    msg: "Account created successfully",
    ...result,
  });
});

const login = asyncWrapper(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    success: true,
    msg: "Login successful",
    ...result,
  });
});

export { register, login };