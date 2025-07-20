import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: 20, // Increased from 5 to 20
  message: {
    error: "Too many authentication attempts",
    message: "Too many login/register attempts. Please try again later.",
    retryAfter: Math.ceil(
      (parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000
    ),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many authentication attempts",
      message: "Too many login/register attempts. Please try again later.",
      retryAfter: Math.ceil(
        (parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) /
          1000
      ),
    });
  },
});

export const transactionLimiter = rateLimit({
  windowMs:
    parseInt(process.env.TRANSACTION_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
  max: 500, // Increased from 100 to 500
  message: {
    error: "Too many transaction requests",
    message: "Too many transaction requests. Please try again later.",
    retryAfter: Math.ceil(
      (parseInt(process.env.TRANSACTION_RATE_LIMIT_WINDOW_MS) ||
        60 * 60 * 1000) / 1000
    ),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many transaction requests",
      message: "Too many transaction requests. Please try again later.",
      retryAfter: Math.ceil(
        (parseInt(process.env.TRANSACTION_RATE_LIMIT_WINDOW_MS) ||
          60 * 60 * 1000) / 1000
      ),
    });
  },
});

export const analyticsLimiter = rateLimit({
  windowMs:
    parseInt(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
  max: 200, // Increased from 50 to 200
  message: {
    error: "Too many analytics requests",
    message: "Too many analytics requests. Please try again later.",
    retryAfter: Math.ceil(
      (parseInt(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000) /
        1000
    ),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many analytics requests",
      message: "Too many analytics requests. Please try again later.",
      retryAfter: Math.ceil(
        (parseInt(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS) ||
          60 * 60 * 1000) / 1000
      ),
    });
  },
});

export const rateLimiter = {
  authLimiter,
  transactionLimiter,
  analyticsLimiter,
};
