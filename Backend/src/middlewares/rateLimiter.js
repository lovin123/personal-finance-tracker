import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5,
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
    parseInt(process.env.TRANSACTION_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: parseInt(process.env.TRANSACTION_RATE_LIMIT_MAX_REQUESTS) || 100,
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
    parseInt(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: parseInt(process.env.ANALYTICS_RATE_LIMIT_MAX_REQUESTS) || 50,
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
