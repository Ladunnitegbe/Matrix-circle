import CustomAPIError from "./custom-error"

class BadRequestError extends CustomAPIError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export default BadRequestError;