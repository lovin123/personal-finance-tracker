// Authentication controller functions for register, login, refresh
import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";
import { generateTokenPair, generateAccessToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({
          error: "User already exists",
          message: "A user with this email already exists",
        });
    }
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    const tokens = generateTokenPair({ userId: user.id, email: user.email });
    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        data: { user, tokens },
      });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({
        error: "Registration failed",
        message: "An error occurred during registration",
      });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({
          error: "Invalid credentials",
          message: "Email or password is incorrect",
        });
    }
    const tokens = generateTokenPair({ userId: user.id, email: user.email });
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
    res
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: { user: userData, tokens },
      });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({
        error: "Login failed",
        message: "An error occurred during login",
      });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(401)
        .json({
          error: "Refresh token required",
          message: "Please provide a refresh token",
        });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });
    if (!user) {
      return res
        .status(401)
        .json({
          error: "Invalid refresh token",
          message: "User no longer exists",
        });
    }
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        },
      });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(401)
        .json({
          error: "Invalid refresh token",
          message: "The provided refresh token is invalid or expired",
        });
    }
    console.error("Token refresh error:", error);
    res
      .status(500)
      .json({
        error: "Token refresh failed",
        message: "An error occurred while refreshing the token",
      });
  }
}
