"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No recent transactions
          </p>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{transaction.title}</h4>
                    <Badge
                      variant={
                        transaction.type === "INCOME" ? "default" : "secondary"
                      }
                      className={
                        transaction.type === "INCOME"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {transaction.type}
                    </Badge>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === "INCOME"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}$
                  {Number(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
