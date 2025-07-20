import moment from "moment";
import { prisma } from "../config/database.js";
import { cache } from "../config/redis.js";

export async function getMonthlyAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : moment().subtract(6, "months").toDate();
    const cacheKey = `analytics:${userId}:monthly:${start.toISOString()}:${end.toISOString()}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res
        .status(200)
        .json({ success: true, data: cachedData, cached: true });
    }
    // Use Prisma groupBy for monthly analytics
    const monthlyData = await prisma.transaction.groupBy({
      by: ["date"],
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });
    // Group by month and sum income/expense
    const monthMap = {};
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
    });
    transactions.forEach((txn) => {
      const month = moment(txn.date).format("YYYY-MM");
      if (!monthMap[month]) {
        monthMap[month] = { month, income: 0, expense: 0 };
      }
      if (txn.type === "INCOME") {
        monthMap[month].income += Number(txn.amount);
      } else if (txn.type === "EXPENSE") {
        monthMap[month].expense += Number(txn.amount);
      }
    });
    const formattedData = Object.values(monthMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        net: item.income - item.expense,
      }));
    const result = {
      monthlyData: formattedData,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
    await cache.set(
      cacheKey,
      result,
      parseInt(process.env.ANALYTICS_CACHE_TTL) || 900
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Monthly analytics error:", error);
    res.status(500).json({
      error: "Failed to retrieve monthly analytics",
      message: "An error occurred while retrieving monthly analytics",
    });
  }
}

export async function getCategoryAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : moment().subtract(12, "months").toDate();
    const cacheKey = `analytics:${userId}:categories:${start.toISOString()}:${end.toISOString()}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res
        .status(200)
        .json({ success: true, data: cachedData, cached: true });
    }
    // Get all transactions in range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      select: {
        category: true,
        type: true,
        amount: true,
      },
    });
    // Aggregate by category
    const categoryMap = {};
    transactions.forEach((txn) => {
      if (!categoryMap[txn.category]) {
        categoryMap[txn.category] = {
          category: txn.category,
          income: 0,
          expense: 0,
        };
      }
      if (txn.type === "INCOME") {
        categoryMap[txn.category].income += Number(txn.amount);
      } else if (txn.type === "EXPENSE") {
        categoryMap[txn.category].expense += Number(txn.amount);
      }
    });
    const totalExpense = Object.values(categoryMap).reduce(
      (sum, cat) => sum + cat.expense,
      0
    );
    const formattedData = Object.values(categoryMap).map((cat) => {
      const total = cat.income - cat.expense;
      const percentage =
        totalExpense > 0 ? (cat.expense / totalExpense) * 100 : 0;
      return {
        ...cat,
        total,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
    const result = {
      categories: formattedData.sort((a, b) => b.expense - a.expense),
      period: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalIncome: formattedData.reduce((sum, item) => sum + item.income, 0),
        totalExpense: formattedData.reduce(
          (sum, item) => sum + item.expense,
          0
        ),
        netAmount: formattedData.reduce((sum, item) => sum + item.total, 0),
      },
    };
    await cache.set(
      cacheKey,
      result,
      parseInt(process.env.ANALYTICS_CACHE_TTL) || 900
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Category analytics error:", error);
    res.status(500).json({
      error: "Failed to retrieve category analytics",
      message: "An error occurred while retrieving category analytics",
    });
  }
}

export async function getOverviewAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : moment().subtract(12, "months").toDate();
    const cacheKey = `analytics:${userId}:overview:${start.toISOString()}:${end.toISOString()}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res
        .status(200)
        .json({ success: true, data: cachedData, cached: true });
    }
    // Get all transactions in range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      select: {
        id: true,
        title: true,
        amount: true,
        type: true,
        category: true,
        date: true,
      },
      orderBy: { date: "desc" },
    });
    // Calculate summary
    let totalIncome = 0,
      totalExpense = 0;
    transactions.forEach((txn) => {
      if (txn.type === "INCOME") totalIncome += Number(txn.amount);
      else if (txn.type === "EXPENSE") totalExpense += Number(txn.amount);
    });
    const netAmount = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;
    // Trends: compare current period to previous period
    const periodDays = moment(end).diff(moment(start), "days");
    const previousStart = moment(start).subtract(periodDays, "days").toDate();
    const previousEnd = start;
    const previousTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: previousStart, lte: previousEnd },
      },
      select: {
        amount: true,
        type: true,
      },
    });
    let previousIncome = 0,
      previousExpense = 0;
    previousTransactions.forEach((txn) => {
      if (txn.type === "INCOME") previousIncome += Number(txn.amount);
      else if (txn.type === "EXPENSE") previousExpense += Number(txn.amount);
    });
    const incomeTrend =
      previousIncome > 0
        ? ((totalIncome - previousIncome) / previousIncome) * 100
        : 0;
    const expenseTrend =
      previousExpense > 0
        ? ((totalExpense - previousExpense) / previousExpense) * 100
        : 0;
    const result = {
      summary: {
        totalIncome,
        totalExpense,
        netAmount,
        savingsRate: Math.round(savingsRate * 100) / 100,
        totalTransactions: transactions.length,
      },
      trends: {
        incomeTrend: Math.round(incomeTrend * 100) / 100,
        expenseTrend: Math.round(expenseTrend * 100) / 100,
      },
      recentTransactions: transactions.slice(0, 10),
      period: { start: start.toISOString(), end: end.toISOString() },
    };
    await cache.set(
      cacheKey,
      result,
      parseInt(process.env.ANALYTICS_CACHE_TTL) || 900
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Overview analytics error:", error);
    res.status(500).json({
      error: "Failed to retrieve overview analytics",
      message: "An error occurred while retrieving overview analytics",
    });
  }
}
