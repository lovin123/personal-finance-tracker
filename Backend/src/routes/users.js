import express from "express";
import { authenticateToken, requireRole } from "../middlewares/auth.js";
import { validateUserId } from "../middlewares/validation.js";
import {
  getUsers,
  getUserById,
  updateUserRole,
  resetUserPassword,
  deleteUser,
} from "../controllers/usersController.js";

const router = express.Router();

router.get("/", authenticateToken, requireRole("ADMIN"), getUsers);
router.get(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUserId,
  getUserById
);
router.put(
  "/:id/role",
  authenticateToken,
  requireRole("ADMIN"),
  validateUserId,
  updateUserRole
);
router.put(
  "/:id/password",
  authenticateToken,
  requireRole("ADMIN"),
  validateUserId,
  resetUserPassword
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole("ADMIN"),
  validateUserId,
  deleteUser
);

export default router;
