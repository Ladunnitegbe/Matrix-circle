import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncController<TRequest extends Request = Request> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

const asyncWrapper = <TRequest extends Request = Request>(
  fn: AsyncController<TRequest>
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req as TRequest, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export default asyncWrapper;
