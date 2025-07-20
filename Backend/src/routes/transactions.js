import express from "express";
import {
  authenticateToken,
  requireRole,
  canAccessResource,
} from "../middlewares/auth.js";
import {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateTransactionQuery,
  validateTransactionId,
} from "../middlewares/validation.js";
import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/", authenticateToken, validateTransactionQuery, getTransactions);
router.post(
  "/",
  authenticateToken,
  requireRole(["ADMIN", "USER"]),
  validateCreateTransaction,
  createTransaction
);
router.get(
  "/:id",
  authenticateToken,
  validateTransactionId,
  canAccessResource(),
  getTransactionById
);
router.put(
  "/:id",
  authenticateToken,
  requireRole(["ADMIN", "USER"]),
  validateUpdateTransaction,
  canAccessResource(),
  updateTransaction
);
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["ADMIN", "USER"]),
  validateTransactionId,
  canAccessResource(),
  deleteTransaction
);

export default router;
