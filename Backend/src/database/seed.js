import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash("User123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@example.com",
      passwordHash: userPassword,
      role: "USER",
    },
  });

  console.log("✅ Regular user created:", user.email);

  // Create read-only user
  const readonlyPassword = await bcrypt.hash("ReadOnly123!", 12);
  const readonlyUser = await prisma.user.upsert({
    where: { email: "readonly@example.com" },
    update: {},
    create: {
      name: "Read Only User",
      email: "readonly@example.com",
      passwordHash: readonlyPassword,
      role: "READ_ONLY",
    },
  });

  console.log("✅ Read-only user created:", readonlyUser.email);

  // Sample transaction categories
  const categories = [
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Education",
    "Housing",
    "Utilities",
    "Insurance",
    "Investment",
    "Salary",
    "Freelance",
    "Bonus",
    "Interest",
    "Dividends",
  ];

  // Create sample transactions for the regular user
  const sampleTransactions = [
    // Income transactions
    {
      title: "Monthly Salary",
      amount: 5000.0,
      type: "INCOME",
      category: "Salary",
      date: new Date("2024-01-15"),
      userId: user.id,
    },
    {
      title: "Freelance Project",
      amount: 1200.0,
      type: "INCOME",
      category: "Freelance",
      date: new Date("2024-01-20"),
      userId: user.id,
    },
    {
      title: "Investment Dividend",
      amount: 150.0,
      type: "INCOME",
      category: "Dividends",
      date: new Date("2024-01-25"),
      userId: user.id,
    },
    // Expense transactions
    {
      title: "Grocery Shopping",
      amount: 250.0,
      type: "EXPENSE",
      category: "Food & Dining",
      date: new Date("2024-01-10"),
      userId: user.id,
    },
    {
      title: "Gas Station",
      amount: 45.0,
      type: "EXPENSE",
      category: "Transportation",
      date: new Date("2024-01-12"),
      userId: user.id,
    },
    {
      title: "Movie Tickets",
      amount: 35.0,
      type: "EXPENSE",
      category: "Entertainment",
      date: new Date("2024-01-14"),
      userId: user.id,
    },
    {
      title: "Online Shopping",
      amount: 120.0,
      type: "EXPENSE",
      category: "Shopping",
      date: new Date("2024-01-16"),
      userId: user.id,
    },
    {
      title: "Doctor Visit",
      amount: 85.0,
      type: "EXPENSE",
      category: "Healthcare",
      date: new Date("2024-01-18"),
      userId: user.id,
    },
    {
      title: "Electricity Bill",
      amount: 95.0,
      type: "EXPENSE",
      category: "Utilities",
      date: new Date("2024-01-22"),
      userId: user.id,
    },
    {
      title: "Restaurant Dinner",
      amount: 65.0,
      type: "EXPENSE",
      category: "Food & Dining",
      date: new Date("2024-01-24"),
      userId: user.id,
    },
    // Previous month transactions for analytics
    {
      title: "December Salary",
      amount: 5000.0,
      type: "INCOME",
      category: "Salary",
      date: new Date("2023-12-15"),
      userId: user.id,
    },
    {
      title: "Holiday Shopping",
      amount: 300.0,
      type: "EXPENSE",
      category: "Shopping",
      date: new Date("2023-12-20"),
      userId: user.id,
    },
    {
      title: "Christmas Dinner",
      amount: 150.0,
      type: "EXPENSE",
      category: "Food & Dining",
      date: new Date("2023-12-25"),
      userId: user.id,
    },
    {
      title: "Year-end Bonus",
      amount: 2000.0,
      type: "INCOME",
      category: "Bonus",
      date: new Date("2023-12-30"),
      userId: user.id,
    },
  ];

  for (const transaction of sampleTransactions) {
    await prisma.transaction.upsert({
      where: {
        id: `${transaction.title}-${transaction.date.toISOString()}-${
          transaction.userId
        }`,
      },
      update: {},
      create: transaction,
    });
  }

  console.log("✅ Sample transactions created");

  // Create some transactions for admin user
  const adminTransactions = [
    {
      title: "Admin Salary",
      amount: 8000.0,
      type: "INCOME",
      category: "Salary",
      date: new Date("2024-01-15"),
      userId: admin.id,
    },
    {
      title: "Office Supplies",
      amount: 75.0,
      type: "EXPENSE",
      category: "Shopping",
      date: new Date("2024-01-18"),
      userId: admin.id,
    },
    {
      title: "Business Lunch",
      amount: 45.0,
      type: "EXPENSE",
      category: "Food & Dining",
      date: new Date("2024-01-20"),
      userId: admin.id,
    },
  ];

  for (const transaction of adminTransactions) {
    await prisma.transaction.upsert({
      where: {
        id: `${transaction.title}-${transaction.date.toISOString()}-${
          transaction.userId
        }`,
      },
      update: {},
      create: transaction,
    });
  }

  console.log("✅ Admin transactions created");

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Default Users:");
  console.log("Admin: admin@example.com / Admin123!");
  console.log("User: user@example.com / User123!");
  console.log("Read-only: readonly@example.com / ReadOnly123!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
