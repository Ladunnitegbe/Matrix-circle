import CustomAPIError from "../error/custom-error";
import ValidationError from "../error/validation-error";
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  console.log(err);

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({
      success: false,
      msg: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
    });
  }

  return res.status(500).json({
    success: false,
    msg: "Something went wrong, please try again later",
  });
};

export default errorHandler;
