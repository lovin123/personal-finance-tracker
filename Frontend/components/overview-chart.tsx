"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export function OverviewChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 3);
        const startDateStr = startDate.toISOString().slice(0, 10);
        const endDateStr = endDate.toISOString().slice(0, 10);
        const response = await apiService.getAnalyticsMonthly(
          startDateStr,
          endDateStr
        );
        setData(response.data.data.monthlyData);
      } catch (error) {
        console.error("Failed to fetch monthly data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--chart-1))",
    },
    expense: {
      label: "Expense",
      color: "hsl(var(--chart-2))",
    },
    net: {
      label: "Net",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[300px] overflow-x-auto"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const date = new Date(value + "-01");
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    });
                  }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-income)" }}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="var(--color-expense)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-expense)" }}
                  name="Expense"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="var(--color-net)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-net)" }}
                  name="Net"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
