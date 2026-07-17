import jwt, { JwtPayload } from "jsonwebtoken";
import UnauthorizedError from "../error/unauthorized-error";
import NotFoundError from "../error/not-found-error";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;

if (!ACCESS_TOKEN_SECRET || !ACCESS_TOKEN_EXPIRES) {
  throw new Error("ACCESS_TOKEN_SECRET or ACCESS_TOKEN_EXPIRES missing in .env");
}

interface TokenPayload {
  userId: string;
  role: string;
}

const createAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES } as jwt.SignOptions);
};

const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token.");
  }
};

export { createAccessToken, verifyAccessToken };