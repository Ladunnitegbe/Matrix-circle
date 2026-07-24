import { Request, Response, NextFunction } from "express";
import ForbiddenError from "../error/forbidden-error";
import UnauthorizedError from "../error/unauthorized-error";
import { verifyAccessToken } from "../utils/jwt";


const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is required.");
  }

  const [, token] = authHeader.split(" ");

  const decoded = verifyAccessToken(token);

  req.user = {
    id: decoded.accountId,
    role: decoded.role,
  };

  next();
};

const authorizePermissions = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required.");
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        "You do not have permission to perform this action."
      );
    }

    next();
  };
};

export {
  authenticateUser,
  authorizePermissions,
};