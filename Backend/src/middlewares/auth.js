import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * Middleware to verify JWT token and extract user information
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Access token required",
        message: "Please provide a valid JWT token in the Authorization header",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid token", message: "User no longer exists" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Your access token has expired. Please login again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid.",
      });
    }
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Authentication error",
      message: "An error occurred during authentication",
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string|string[]} roles - Required role(s)
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please login to access this resource",
      });
    }
    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `Access denied. Required role(s): ${requiredRoles.join(
          ", "
        )}. Your role: ${userRole}`,
      });
    }
    next();
  };
};

/**
 * Middleware to check if user can access/modify a resource
 * @param {string} resourceUserIdField - Field name containing the user ID in the resource
 */
export const canAccessResource = (resourceUserIdField = "userId") => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please login to access this resource",
      });
    }
    const userRole = req.user.role;
    const userId = req.user.id;
    if (userRole === "ADMIN") {
      return next();
    }
    const resourceId = req.params.id || req.body.id;
    if (!resourceId) {
      return res.status(400).json({
        error: "Resource ID required",
        message: "Resource ID is required for access control",
      });
    }
    try {
      const resource = await prisma.transaction.findUnique({
        where: { id: resourceId },
        select: { [resourceUserIdField]: true },
      });
      if (!resource) {
        return res.status(404).json({
          error: "Resource not found",
          message: "The requested resource does not exist",
        });
      }
      if (resource[resourceUserIdField] !== userId) {
        return res.status(403).json({
          error: "Access denied",
          message: "You can only access your own resources",
        });
      }
      next();
    } catch (error) {
      console.error("Resource access check error:", error);
      return res.status(500).json({
        error: "Access control error",
        message: "An error occurred while checking resource access",
      });
    }
  };
};
