const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  // Log the detailed error
  logger.error("API Error: %o", err);

  // 1. Joi Validation Error
  if (err.isJoi || (err.details && err._original)) {
    const messages = err.details.map(d => d.message);
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: messages
    });
  }

  // 2. Prisma Client Database Errors
  if (err.code) {
    // Prisma unique constraint validation
    if (err.code === "P2002") {
      const target = err.meta?.target?.join(", ") || "field";
      return res.status(400).json({
        status: "fail",
        message: `Unique constraint failed on ${target}. The value already exists.`
      });
    }
    // Prisma record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "fail",
        message: err.meta?.cause || "Record not found"
      });
    }
  }

  // 3. Custom Application/Auth Errors
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected system error occurred";

  res.status(statusCode).json({
    status: statusCode === 500 ? "error" : "fail",
    message
  });
}

module.exports = errorHandler;
