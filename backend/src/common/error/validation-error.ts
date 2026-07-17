import CustomAPIError from "./custom-error";

export type ValidationIssue = {
  field: string;
  message: string;
};

class ValidationError extends CustomAPIError {
  errors: ValidationIssue[];

  constructor(errors: ValidationIssue[]) {
    super("Validation failed", 400);
    this.errors = errors;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export default ValidationError;
