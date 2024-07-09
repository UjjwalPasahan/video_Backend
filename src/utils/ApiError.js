class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode || 500;
        this.message = message;
        this.success = false;

        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError };
