"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiService } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Activity,
} from "lucide-react";
import { OverviewChart } from "@/components/overview-chart";
import { CategoryChart } from "@/components/category-chart";
import { RecentTransactions } from "@/components/recent-transactions";

interface OverviewData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    savingsRate: number;
    totalTransactions: number;
  };
  trends: {
    incomeTrend: number;
    expenseTrend: number;
  };
  recentTransactions: any[];
  period: {
    start: string;
    end: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 3);
        const startDateStr = startDate.toISOString().slice(0, 10);
        const endDateStr = endDate.toISOString().slice(0, 10);
        const response = await apiService.getAnalyticsOverview(
          startDateStr,
          endDateStr
        );
        setOverview(response.data.data);
      } catch (error) {
        console.error("Failed to fetch overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const { summary, trends } = overview;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalIncome.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trends.incomeTrend > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(trends.incomeTrend)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.totalExpense.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {trends.expenseTrend > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              )}
              {Math.abs(trends.expenseTrend)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.netAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${summary.netAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Savings Rate: {Number(summary.savingsRate).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <OverviewChart />
        <CategoryChart />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions transactions={overview.recentTransactions} />
    </div>
  );
}
