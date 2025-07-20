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
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface CategoryData {
  category: string;
  expense: number;
  percentage: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CategoryChart() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 3);
        const startDateStr = startDate.toISOString().slice(0, 10);
        const endDateStr = endDate.toISOString().slice(0, 10);
        const response = await apiService.getAnalyticsCategories(
          startDateStr,
          endDateStr
        );
        const expenseData = response.data.data.categories
          .filter((cat: any) => cat.expense > 0)
          .map((cat: any) => ({
            category: cat.category,
            expense: cat.expense,
            percentage: cat.percentage,
          }));
        setData(expenseData);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartConfig = data.reduce((config, item, index) => {
    config[item.category.toLowerCase()] = {
      label: item.category,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as any);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>Breakdown of expenses by category</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No expense data available</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <ChartContainer config={chartConfig} className="h-[300px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="expense"
                    label={({ category, percentage }) =>
                      `${category} (${Number(percentage).toFixed(1)}%)`
                    }
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-2">
              {data.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center space-x-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{item.category}</span>
                  <span className="text-sm text-muted-foreground">
                    ${Number(item.expense).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
