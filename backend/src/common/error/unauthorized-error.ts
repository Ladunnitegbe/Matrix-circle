import CustomAPIError from "./custom-error";


class UnauthorizedError extends CustomAPIError{
    constructor(message: string){
        super(message, 401),

        Object.setPrototypeOf(this, CustomAPIError.prototype)
    }
}
export default UnauthorizedError;

