export const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.error('Async Handler Error:', error); // Log the error for debugging
        error.statusCode = error.statusCode || 500;
        next(error);
    }
};
