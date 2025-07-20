/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === "P2002") {
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists",
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({
      error: "Record not found",
      message: "The requested record was not found",
    });
  }
  if (err.code === "P2003") {
    return res.status(400).json({
      error: "Foreign key constraint failed",
      message: "The operation violates a foreign key constraint",
    });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      message: err.message,
      details: err.errors,
    });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "The provided token is invalid",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "The provided token has expired",
    });
  }
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid ID format",
      message: "The provided ID is not in the correct format",
    });
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({
    error: "Server error",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
