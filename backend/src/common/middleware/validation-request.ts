import { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";
import ValidationError, { ValidationIssue } from "../error/validation-error";

type RequestValidationSchema = Partial<{
  body: z.ZodType;
  params: z.ZodType;
  query: z.ZodType;
}>;

const formatIssues = (issues: z.core.$ZodIssue[]): ValidationIssue[] => {
  return issues.map((issue) => ({
    field: issue.path.length ? issue.path.join(".") : "request",
    message: issue.message,
  }));
};

const validateRequest = (schema: RequestValidationSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const issues: ValidationIssue[] = [];

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        issues.push(...formatIssues(result.error.issues));
      } else {
        req.body = result.data;
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        issues.push(...formatIssues(result.error.issues));
      } else {
        req.params = result.data as Record<string, string>;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        issues.push(...formatIssues(result.error.issues));
      } else {
        req.query = result.data as Request["query"];
      }
    }

    if (issues.length > 0) {
      throw new ValidationError(issues);
    }

    next();
  };
};

export default validateRequest;
