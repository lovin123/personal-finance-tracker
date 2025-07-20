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
    const monthlyData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', date) as month,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE userId = ${userId} 
        AND date >= ${start} 
        AND date <= ${end}
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month ASC
    `;
    const formattedData = monthlyData.map((item) => ({
      month: moment(item.month).format("YYYY-MM"),
      income: parseFloat(item.income || 0),
      expense: parseFloat(item.expense || 0),
      net: parseFloat(item.income || 0) - parseFloat(item.expense || 0),
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
    res
      .status(500)
      .json({
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
    const categoryData = await prisma.$queryRaw`
      SELECT 
        category,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
      FROM transactions 
      WHERE userId = ${userId} 
        AND date >= ${start} 
        AND date <= ${end}
      GROUP BY category
      ORDER BY (SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END)) DESC
    `;
    const totalExpenses = categoryData.reduce(
      (sum, item) => sum + parseFloat(item.expense || 0),
      0
    );
    const formattedData = categoryData.map((item) => {
      const income = parseFloat(item.income || 0);
      const expense = parseFloat(item.expense || 0);
      const total = income - expense;
      const percentage =
        totalExpenses > 0 ? (expense / totalExpenses) * 100 : 0;
      return {
        category: item.category,
        income,
        expense,
        total,
        percentage: Math.round(percentage * 100) / 100,
      };
    });
    const result = {
      categories: formattedData,
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
    res
      .status(500)
      .json({
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
    const [summaryData, recentTransactions] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as totalIncome,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as totalExpense,
          COUNT(*) as totalTransactions
        FROM transactions 
        WHERE userId = ${userId} 
          AND date >= ${start} 
          AND date <= ${end}
      `,
      prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end } },
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
      }),
    ]);
    const totalIncome = parseFloat(summaryData[0]?.totalIncome || 0);
    const totalExpense = parseFloat(summaryData[0]?.totalExpense || 0);
    const netAmount = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;
    const currentPeriodStart = moment(start);
    const previousPeriodStart = moment(start).subtract(
      moment(end).diff(moment(start), "days"),
      "days"
    );
    const previousPeriodEnd = moment(start);
    const [currentPeriodData, previousPeriodData] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE userId = ${userId} 
          AND date >= ${start} 
          AND date <= ${end}
      `,
      prisma.$queryRaw`
        SELECT 
          SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
        FROM transactions 
        WHERE userId = ${userId} 
          AND date >= ${previousPeriodStart.toDate()} 
          AND date <= ${previousPeriodEnd.toDate()}
      `,
    ]);
    const currentIncome = parseFloat(currentPeriodData[0]?.income || 0);
    const currentExpense = parseFloat(currentPeriodData[0]?.expense || 0);
    const previousIncome = parseFloat(previousPeriodData[0]?.income || 0);
    const previousExpense = parseFloat(previousPeriodData[0]?.expense || 0);
    const incomeTrend =
      previousIncome > 0
        ? ((currentIncome - previousIncome) / previousIncome) * 100
        : 0;
    const expenseTrend =
      previousExpense > 0
        ? ((currentExpense - previousExpense) / previousExpense) * 100
        : 0;
    const result = {
      summary: {
        totalIncome,
        totalExpense,
        netAmount,
        savingsRate: Math.round(savingsRate * 100) / 100,
        totalTransactions: parseInt(summaryData[0]?.totalTransactions || 0),
      },
      trends: {
        incomeTrend: Math.round(incomeTrend * 100) / 100,
        expenseTrend: Math.round(expenseTrend * 100) / 100,
      },
      recentTransactions,
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
    res
      .status(500)
      .json({
        error: "Failed to retrieve overview analytics",
        message: "An error occurred while retrieving overview analytics",
      });
  }
}
