import CustomAPIError from "./custom-error";


class UnauthorizedError extends CustomAPIError{
    constructor(message: string){
        super(message, 401);

        Object.setPrototypeOf(this, UnauthorizedError.prototype)
    }
}
export default UnauthorizedError;

