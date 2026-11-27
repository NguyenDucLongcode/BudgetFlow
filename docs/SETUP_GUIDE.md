# Setup Guide

Follow this step-by-step guide to run **BudgetFlow** locally for development.

---

## 1. Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js** `>= 20.x` and **npm** `>= 10.x`
- **Docker** & **Docker Compose** (for PostgreSQL 15 and Redis)
- **Git**

---

## 2. Clone the Repository

```bash
git clone <your-repository-url> BudgetFlow
cd BudgetFlow
```

---

## 3. Start Infrastructure with Docker (PostgreSQL & Redis)

The `docker/docker-compose.yml` file provisions **PostgreSQL 15** (mapped to host port `5433`), **Redis** (port `6379`), **Prometheus**, and **Grafana**.

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

Verify both containers are healthy:

```bash
docker ps
```

> **Note:** PostgreSQL is exposed on **`localhost:5433`** (not `5432`) to avoid conflicts with any local PostgreSQL installation.

---

## 4. Configure & Run Backend (NestJS)

### 4.1. Install Dependencies

```bash
cd backend
npm install
```

### 4.2. Configure Environment Variables

Copy the example environment file and update secrets as needed:

```bash
cp .env.example .env
```

Minimum required configuration in `backend/.env`:

```env
NODE_ENV=development
PORT=8080
DATABASE_URL="postgresql://postgres:123456@localhost:5433/db_postgres?schema=public"

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=your_strong_access_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

### 4.3. Run Database Migrations & Seed Data

```bash
# Apply Prisma schema migrations
npx prisma migrate dev

# Seed default bilingual categories (VI/EN) and sample data
npm run seed
```

### 4.4. Start the Backend Server

```bash
npm run start:dev
```

- API Base URL: `http://localhost:8080/api/v1`
- Swagger UI: [`http://localhost:8080/api/docs`](http://localhost:8080/api/docs)

---

## 5. Configure & Run Frontend (Next.js)

Open a new terminal window at the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
BACKEND_API_URL=http://localhost:8080/api/v1
REDIS_URL=redis://localhost:6379
```

Start the Next.js development server:

```bash
npm run dev
```

Open [`http://localhost:3000`](http://localhost:3000) in your browser.

---

## 6. Verification Checklist

1. Visit [`http://localhost:3000`](http://localhost:3000) — landing page loads without 401 redirect loops; language switcher toggles between EN and VI.
2. Register or sign in — redirects to `/dashboard`.
3. Create a wallet, record a transaction, and verify:
   - Dashboard StatCards update immediately.
   - `/reports` renders daily cashflow, category breakdown, and monthly spending allocation charts.
   - `/recurring` allows scheduling recurring transactions processed by the backend cron job.
4. Run production builds on both packages:
   ```bash
   npm --prefix backend run build
   npm --prefix frontend run build
   ```
