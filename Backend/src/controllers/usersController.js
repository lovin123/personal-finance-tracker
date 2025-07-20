import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";

export async function getUsers(req, res) {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { transactions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    res
      .status(200)
      .json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        },
      });
  } catch (error) {
    console.error("Get users error:", error);
    res
      .status(500)
      .json({
        error: "Failed to retrieve users",
        message: "An error occurred while retrieving users",
      });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        transactions: {
          orderBy: { date: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            amount: true,
            type: true,
            category: true,
            date: true,
          },
        },
        _count: { select: { transactions: true } },
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({
          error: "User not found",
          message: "The requested user does not exist",
        });
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({
        error: "Failed to retrieve user",
        message: "An error occurred while retrieving the user",
      });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ["ADMIN", "USER", "READ_ONLY"];
    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({
          error: "Invalid role",
          message: "Role must be one of: ADMIN, USER, READ_ONLY",
        });
    }
    if (id === req.user.id) {
      return res
        .status(400)
        .json({
          error: "Cannot change own role",
          message: "You cannot change your own role",
        });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
    res
      .status(200)
      .json({
        success: true,
        message: "User role updated successfully",
        data: { user },
      });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({
          error: "User not found",
          message: "The requested user does not exist",
        });
    }
    console.error("Update user role error:", error);
    res
      .status(500)
      .json({
        error: "Failed to update user role",
        message: "An error occurred while updating the user role",
      });
  }
}

export async function resetUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({
          error: "Invalid password",
          message: "Password must be at least 8 characters long",
        });
    }
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    res
      .status(200)
      .json({ success: true, message: "User password reset successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({
          error: "User not found",
          message: "The requested user does not exist",
        });
    }
    console.error("Reset user password error:", error);
    res
      .status(500)
      .json({
        error: "Failed to reset user password",
        message: "An error occurred while resetting the user password",
      });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res
        .status(400)
        .json({
          error: "Cannot delete own account",
          message: "You cannot delete your own account",
        });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      return res
        .status(404)
        .json({
          error: "User not found",
          message: "The requested user does not exist",
        });
    }
    await prisma.user.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({
          error: "User not found",
          message: "The requested user does not exist",
        });
    }
    console.error("Delete user error:", error);
    res
      .status(500)
      .json({
        error: "Failed to delete user",
        message: "An error occurred while deleting the user",
      });
  }
}
