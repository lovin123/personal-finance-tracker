import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { validateAnalyticsQuery } from "../middlewares/validation.js";
import {
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getOverviewAnalytics,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get(
  "/monthly",
  authenticateToken,
  validateAnalyticsQuery,
  getMonthlyAnalytics
);
router.get(
  "/categories",
  authenticateToken,
  validateAnalyticsQuery,
  getCategoryAnalytics
);
router.get(
  "/overview",
  authenticateToken,
  validateAnalyticsQuery,
  getOverviewAnalytics
);

export default router;
