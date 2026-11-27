# BudgetFlow Backend

Modular REST & WebSocket API built with **NestJS 11**, **Prisma ORM**, **PostgreSQL**, and **Redis**.

---

## Overview

The backend follows a **modular, repository-driven architecture**:
- **Global Prefix & URI Versioning:** All API endpoints are served under `/api/v1/...` (configurable via `API_PREFIX` and `API_VERSION`), while operational endpoints (`/health`, `/metrics`) are excluded from the prefix.
- **Security Layer:** Helmet HTTP headers, Cookie Parser, CASL policy-based authorization (`@CheckPolicies`), rate limiting (`@nestjs/throttler`), and JWT + Google OAuth 2.0 strategies.
- **Data Access:** Centralized `PrismaModule` (`@Global()`) exposing domain repositories (`UserRepository`, `WalletRepository`, `TransactionRepository`, `BudgetRepository`, `GoalRepository`, `DebtRepository`, `RecurringTransactionRepository`, etc.).

---

## Core Modules

Located under `src/modules/`:

| Module | Directory | Responsibility |
| :--- | :--- | :--- |
| **Auth** | `auth/` | Registration, login, JWT access/refresh token rotation, Google OAuth, email verification, password reset |
| **User & Preferences** | `user/`, `user-preference/` | User profile (`/users/me`), language (`EN`/`VI`), currency & UI preferences |
| **Session & Audit** | `session/`, `audit/` | Multi-device session tracking (`x-device-id`) and security audit logs |
| **Wallet** | `wallet/` | Multi-currency wallets, balance updates, default wallet, archiving, bilingual `nameVi`/`nameEn` |
| **Category & Tag** | `category/`, `tag/` | System & user categories (`nameVi`, `nameEn`, icon, color) and transaction tags |
| **Transaction** | `transaction/` | Income, Expense, Transfer CRUD, attachments, monthly statistics |
| **Budget** | `budget/` | Monthly/periodic spending limits, budget summary, threshold notifications |
| **Goal** | `goal/` | Savings goals, progress tracking, wallet-linked contributions (`GoalContribution`) |
| **Debt & Debt Payment** | `debt/`, `debt-payment/` | Loan (`LOAN`) and Receivable (`DEBT`) tracking with repayment schedules |
| **Recurring Transaction** | `recurring-transaction/` | Scheduled recurring rules + `RecurringCronService` (`@Cron`) auto-execution |
| **Notification** | `notification/` | Persistent notifications + `NotificationGateway` (Socket.IO realtime push) |
| **Report** | `report/` | `GET /reports/monthly` — daily cashflow, month-over-month comparison, top categories, top transactions, and `cashFlowBreakdown` (Living / Debt / Goal Savings) |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure the required variables:

| Variable | Required | Default / Example | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Application environment (`development` \| `production`) |
| `PORT` | Yes | `8080` | HTTP & WebSocket server port |
| `MAX_WALLETS_PER_USER` | No | `5` | Maximum active wallets allowed per user |
| `DATABASE_URL` | Yes | `postgresql://postgres:123456@localhost:5433/db_postgres?schema=public` | PostgreSQL connection string (port `5433` when using Docker Compose) |
| `REDIS_HOST` | Yes | `localhost` | Redis server hostname |
| `REDIS_PORT` | Yes | `6379` | Redis server port |
| `REDIS_PASSWORD` | No | — | Redis password (if authentication is enabled) |
| `JWT_ACCESS_SECRET` | Yes | *(random secret)* | Secret key for signing short-lived access tokens |
| `JWT_REFRESH_SECRET` | Yes | *(random secret)* | Secret key for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth 2.0 Client Secret |
| `GOOGLE_CALLBACK_URL` | No | `http://localhost:8080/api/v1/auth/google/callback` | Google OAuth callback URL |
| `SMTP_HOST` / `SMTP_PORT` | No | `smtp.gmail.com` / `587` | Outgoing SMTP host & port for transactional emails |
| `SMTP_USER` / `SMTP_PASS` | No | — | SMTP credentials |
| `SMTP_FROM_EMAIL` / `SMTP_FROM_NAME` | No | `BudgetFlow` | Sender identity for verification & reset emails |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Allowed frontend origin (CORS & email links) |

---

## Installation & Running

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Run Prisma Migrations & Seed Data

Ensure PostgreSQL and Redis are running (see [`docs/SETUP_GUIDE.md`](../docs/SETUP_GUIDE.md)):

```bash
# Generate Prisma client & apply database migrations
npx prisma migrate dev

# Seed default categories, sample wallets, and initial data
npm run seed
```

### 3. Start the Development Server

```bash
# Watch mode (hot reload)
npm run start:dev

# Production build & start
npm run build
npm run start:prod
```

---

## API Documentation

When `NODE_ENV` is not `production`, interactive **Swagger / OpenAPI** documentation is automatically available at:

- **Swagger UI:** [`http://localhost:8080/api/docs`](http://localhost:8080/api/docs)
- **Prometheus Metrics:** [`http://localhost:8080/metrics`](http://localhost:8080/metrics)
