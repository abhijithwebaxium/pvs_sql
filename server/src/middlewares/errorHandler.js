// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Use err.statusCode if available (from AppError), otherwise use res.statusCode or default to 500
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Send user-friendly response without status code in message
  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

// Not found handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
