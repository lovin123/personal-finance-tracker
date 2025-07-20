# Personal Finance Tracker

A full-stack web application to help users manage their personal finances, track transactions, analyze spending, and visualize financial data.

## Default Credentials for All Roles

After seeding the database, you can use the following credentials to log in as different roles:

| Role      | Email                | Password     |
| --------- | -------------------- | ------------ |
| Admin     | admin@example.com    | Admin123!    |
| User      | user@example.com     | User123!     |
| Read-only | readonly@example.com | ReadOnly123! |

## Features

- User authentication (register, login)
- Add, edit, and delete transactions
- Categorize transactions
- Dashboard with analytics and charts
- Recent transactions overview
- Responsive and modern UI

## Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (or your preferred database)
- Redis (for caching/rate limiting)
- JWT Authentication

### Frontend

- Next.js (React)
- Tailwind CSS
- TypeScript
- Charting libraries for data visualization

## Setup Instructions

### Prerequisites

- Node.js (v16+ recommended)
- npm or pnpm
- PostgreSQL (or your chosen DB)
- Redis (optional, for rate limiting)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd Personal-Finance-Tracker
```

### 2. Backend Setup

```bash
cd Backend
cp env.example .env # Fill in your environment variables
npm install
# or
pnpm install

# Set up the database
npx prisma migrate dev --name init
# (Optional) Seed the database
node src/database/seed.js

# Start the backend server
npm start
```

#### Environment Variables

Edit `.env` in the `Backend/` folder. See `env.example` for required variables.

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
# or
pnpm install

# Start the frontend (Next.js)
npm run dev
```

### 4. Access the App

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000) (or as configured)

## Folder Structure

```
Personal Finance Tracker/
  Backend/         # Express.js API, Prisma, controllers, routes
  Frontend/        # Next.js app, components, pages, styles
```

## Usage

1. Register a new account or log in.
2. Add your income and expense transactions.
3. View analytics and charts on the dashboard.
4. Manage your transactions and categories.

