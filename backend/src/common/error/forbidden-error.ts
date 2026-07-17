import CustomAPIError from "./custom-error";

class ForbiddenError extends CustomAPIError {
  constructor(message: string) {
    super(message, 403);

    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export default ForbiddenError;

