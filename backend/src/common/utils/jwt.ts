import "dotenv/config";
import jwt from "jsonwebtoken";
import UnauthorizedError from "../error/unauthorized-error";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ?? process.env.JWT_SECRET;

const ACCESS_TOKEN_EXPIRES =
  process.env.ACCESS_TOKEN_EXPIRES ?? process.env.JWT_EXPIRES_IN;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET (or JWT_SECRET) is missing in the environment."
  );
}

if (!ACCESS_TOKEN_EXPIRES) {
  throw new Error(
    "ACCESS_TOKEN_EXPIRES (or JWT_EXPIRES_IN) is missing in the environment."
  );
}

interface TokenPayload {
  accountId: string;
  role: string;
}

const createAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  } as jwt.SignOptions);
};

const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token.");
  }
};

export { createAccessToken, verifyAccessToken };