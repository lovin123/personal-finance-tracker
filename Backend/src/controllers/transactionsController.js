import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";

export async function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (userRole !== "ADMIN") where.userId = userId;
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: "desc" },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);
    res
      .status(200)
      .json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        },
      });
  } catch (error) {
    console.error("Get transactions error:", error);
    res
      .status(500)
      .json({
        error: "Failed to retrieve transactions",
        message: "An error occurred while retrieving transactions",
      });
  }
}

export async function createTransaction(req, res) {
  try {
    const userId = req.user.id;
    const { title, amount, type, category, date } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    await cache.invalidateAnalyticsCache(userId);
    res
      .status(201)
      .json({
        success: true,
        message: "Transaction created successfully",
        data: { transaction },
      });
  } catch (error) {
    console.error("Create transaction error:", error);
    res
      .status(500)
      .json({
        error: "Failed to create transaction",
        message: "An error occurred while creating the transaction",
      });
  }
}

export async function getTransactionById(req, res) {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!transaction) {
      return res
        .status(404)
        .json({
          error: "Transaction not found",
          message: "The requested transaction does not exist",
        });
    }
    res.status(200).json({ success: true, data: { transaction } });
  } catch (error) {
    console.error("Get transaction error:", error);
    res
      .status(500)
      .json({
        error: "Failed to retrieve transaction",
        message: "An error occurred while retrieving the transaction",
      });
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.amount !== undefined)
      updateData.amount = parseFloat(req.body.amount);
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.category !== undefined)
      updateData.category = req.body.category;
    if (req.body.date !== undefined) updateData.date = new Date(req.body.date);
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    await cache.invalidateAnalyticsCache(userId);
    res
      .status(200)
      .json({
        success: true,
        message: "Transaction updated successfully",
        data: { transaction },
      });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({
          error: "Transaction not found",
          message: "The requested transaction does not exist",
        });
    }
    console.error("Update transaction error:", error);
    res
      .status(500)
      .json({
        error: "Failed to update transaction",
        message: "An error occurred while updating the transaction",
      });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!transaction) {
      return res
        .status(404)
        .json({
          error: "Transaction not found",
          message: "The requested transaction does not exist",
        });
    }
    await prisma.transaction.delete({ where: { id } });
    await cache.invalidateAnalyticsCache(userId);
    res
      .status(200)
      .json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({
          error: "Transaction not found",
          message: "The requested transaction does not exist",
        });
    }
    console.error("Delete transaction error:", error);
    res
      .status(500)
      .json({
        error: "Failed to delete transaction",
        message: "An error occurred while deleting the transaction",
      });
  }
}
