import CustomAPIError from "./custom-error";

class NotFoundError extends CustomAPIError {
  constructor(message: string) {
    super(message, 404);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export default NotFoundError;