# Personal Finance Tracker Backend

A full-featured Express.js backend for a Personal Finance Tracker application with multi-role access control, Redis caching, and comprehensive analytics.

## 🚀 Features

- **Multi-Role Access Control (RBAC)**: Admin, User, and Read-only roles
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **PostgreSQL Database**: Using Prisma ORM for type-safe database operations
- **Redis Caching**: Intelligent caching for analytics and performance optimization
- **Comprehensive Analytics**: Monthly, category-wise, and overview analytics
- **Rate Limiting**: Configurable rate limiting for different endpoints
- **Security Middleware**: Helmet, XSS protection, input validation
- **Swagger API Documentation**: Complete OpenAPI documentation
- **Transaction Management**: Full CRUD operations with filtering and pagination

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd personal-finance-tracker-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/personal_finance_tracker"

   # Redis Configuration
   REDIS_URL="redis://localhost:6379"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

## 🔐 Authentication

### Default Users

After running the seed script, you'll have these default users:

| Email                | Password     | Role      |
| -------------------- | ------------ | --------- |
| admin@example.com    | Admin123!    | ADMIN     |
| user@example.com     | User123!     | USER      |
| readonly@example.com | ReadOnly123! | READ_ONLY |

### Authentication Flow

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Refresh Token**: `POST /api/auth/refresh`

## 🏗️ API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Transactions

- `GET /api/transactions` - Get all transactions (with filtering)
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Analytics

- `GET /api/analytics/monthly` - Monthly spending/income analytics
- `GET /api/analytics/categories` - Category-wise breakdown
- `GET /api/analytics/overview` - Overview with trends

### Users (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/password` - Reset user password
- `DELETE /api/users/:id` - Delete a user

## 🔒 Role-Based Access Control

### Role Permissions

| Endpoint                 | ADMIN | USER | READ_ONLY |
| ------------------------ | ----- | ---- | --------- |
| GET /api/transactions    | ✅    | ✅   | ✅        |
| POST /api/transactions   | ✅    | ✅   | ❌        |
| PUT /api/transactions    | ✅    | ✅   | ❌        |
| DELETE /api/transactions | ✅    | ✅   | ❌        |
| GET /api/analytics/\*    | ✅    | ✅   | ✅        |
| GET /api/users           | ✅    | ❌   | ❌        |
| PUT /api/users/\*        | ✅    | ❌   | ❌        |
| DELETE /api/users/\*     | ✅    | ❌   | ❌        |

### Resource Access Control

- **Admin**: Can access all resources
- **User**: Can only access their own transactions
- **Read-only**: Can only view transactions (no create/update/delete)

## 🗄️ Database Schema

### Users Table

```sql
- id (UUID, Primary Key)
- name (String)
- email (String, Unique)
- passwordHash (String)
- role (Enum: ADMIN, USER, READ_ONLY)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Transactions Table

```sql
- id (UUID, Primary Key)
- title (String)
- amount (Decimal)
- type (Enum: INCOME, EXPENSE)
- category (String)
- date (DateTime)
- userId (UUID, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)
```

## 🚀 Rate Limiting

| Endpoint              | Limit        | Window     |
| --------------------- | ------------ | ---------- |
| `/api/auth/*`         | 5 requests   | 15 minutes |
| `/api/transactions/*` | 100 requests | 1 hour     |
| `/api/analytics/*`    | 50 requests  | 1 hour     |

## 💾 Caching Strategy

### Redis Cache Configuration

- **Analytics Cache**: 15 minutes TTL
- **Category Cache**: 1 hour TTL
- **Cache Invalidation**: Automatic on data mutation

### Cache Keys

- `analytics:{userId}:monthly:{startDate}:{endDate}`
- `analytics:{userId}:categories:{startDate}:{endDate}`
- `analytics:{userId}:overview:{startDate}:{endDate}`

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed

# Run tests
npm test
```

### Environment Variables

| Variable                 | Description                  | Default                |
| ------------------------ | ---------------------------- | ---------------------- |
| `PORT`                   | Server port                  | 3000                   |
| `NODE_ENV`               | Environment                  | development            |
| `DATABASE_URL`           | PostgreSQL connection string | -                      |
| `REDIS_URL`              | Redis connection string      | redis://localhost:6379 |
| `JWT_SECRET`             | JWT signing secret           | -                      |
| `JWT_REFRESH_SECRET`     | JWT refresh secret           | -                      |
| `JWT_EXPIRES_IN`         | Access token expiry          | 15m                    |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry         | 7d                     |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Production Deployment

1. **Set environment variables**

   ```bash
   NODE_ENV=production
   DATABASE_URL="your-production-database-url"
   REDIS_URL="your-production-redis-url"
   JWT_SECRET="your-production-jwt-secret"
   JWT_REFRESH_SECRET="your-production-refresh-secret"
   ```

2. **Install dependencies**

   ```bash
   npm ci --only=production
   ```

3. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 🔍 Monitoring & Logging

The application includes:

- Request/response logging
- Error tracking
- Performance monitoring
- Database query logging (development)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the logs for error details

---

**Happy coding! 🎉**
