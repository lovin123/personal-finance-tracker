import express from "express";
import { validateRegister, validateLogin } from "../middlewares/validation.js";
import { register, login, refresh } from "../controllers/authController.js";

const router = express.Router();

// Register
router.post("/register", validateRegister, register);
// Login
router.post("/login", validateLogin, login);
// Refresh
router.post("/refresh", refresh);

export default router;
