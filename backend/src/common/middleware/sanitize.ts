// middlewares/sanitize.middleware.ts
import { Request, Response, NextFunction } from "express";
import sanitize from "mongo-sanitize";
import xss from "xss";

const SKIP_XSS_FIELDS = new Set(["password"]);

type Sanitizable = string | number | boolean | null | undefined | Sanitizable[] | { [key: string]: Sanitizable };

const deepSanitize = (obj: Sanitizable, keyName?: string): Sanitizable => {
  if (typeof obj === "string") {
    return keyName && SKIP_XSS_FIELDS.has(keyName) ? obj : xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepSanitize(item, keyName));
  }
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      obj[key] = deepSanitize(obj[key], key);
    }
    return obj;
  }
  return obj;
};

declare module "express-serve-static-core" {
  interface Request {
    sanitizedQuery?: Record<string, unknown>;
  }
}

const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) req.body = deepSanitize(sanitize(req.body));
  if (req.params) req.params = deepSanitize(sanitize(req.params)) as Record<string, string>;
  if (req.query) req.sanitizedQuery = deepSanitize(sanitize(req.query)) as Record<string, unknown>;

  next();
};

export default sanitizeInputs;