# BudgetFlow Frontend

Modern personal finance web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## Overview

The Frontend serves both the user-facing personal finance workspace (`/dashboard`, `/wallets`, `/transactions`, `/budgets`, `/goals`, `/debts`, `/recurring`, `/reports`, `/settings`) and the administrative operations console (`/admin/*`). It implements a **Backend-for-Frontend (BFF)** architecture using Next.js Route Handlers (`src/app/api/**`) to keep JWT access tokens completely off the browser.

---

## Architecture Highlights

### 1. Backend-for-Frontend (BFF) Pattern
- Browser components never communicate directly with NestJS REST endpoints or store JWT access tokens in `localStorage`.
- Instead, client-side Axios (`src/lib/axios/axio-client.ts` via `browserApiClient`) sends requests to Next.js Route Handlers (`/api/*`).
- Next.js Server Route Handlers (`serverApiClient`) look up the user's `accessToken` from **Redis** using the session/device context, attach `Authorization: Bearer <token>`, and proxy the request to NestJS (`http://localhost:8080/api/v1`).
- Mutations are protected by a **CSRF Double Submit Cookie** (`XSRF-TOKEN` cookie matched against the `x-xsrf-token` header).

### 2. Realtime Sync (React Query + WebSocket)
- **TanStack React Query v5** manages server state caching, optimistic updates, and automatic invalidation across Dashboard widgets (`invalidateDashboardQueries` invalidates `dashboard-summary`, `wallets`, `transactions`, `budgets`, `budget-summary`, `goals`, `debts`, `reports`, and `statistics` upon mutations).
- **Socket.IO (`socket.io-client`)** connects to the NestJS `NotificationGateway` to push real-time notifications (e.g., budget alerts, completed recurring transactions) without manual page reloads.

---

## Directory Structure

```text
frontend/src/
├── app/
│   ├── (auth)/               # Login, Register, Forgot/Reset Password, Email Verification
│   ├── (user)/               # Authenticated user workspace
│   │   ├── dashboard/        # Overview StatCards, charts, recent activity
│   │   ├── wallets/          # Multi-currency wallets management
│   │   ├── transactions/     # Transaction history, filters, search, detail modal
│   │   ├── budgets/          # Monthly budgets & alerts
│   │   ├── goals/            # Savings goals & contributions
│   │   ├── debts/            # Loans & receivables tracking
│   │   ├── recurring/        # Scheduled recurring transactions
│   │   ├── reports/          # Monthly financial analytics (Recharts)
│   │   └── settings/         # Profile & preferences
│   ├── admin/                # Admin operations console (Users, Sessions, Audit Logs, Metrics)
│   └── api/                  # Next.js BFF Route Handlers (proxy to NestJS + Redis session)
├── client/                   # Domain services & React Query hooks (auth, wallet, transaction, report, ...)
├── components/
│   ├── common/               # LanguageSwitcher, BrandLogo, shared UI helpers
│   ├── layout/               # UserSidebar, UserTopbar, AdminSidebar, OpsSidebar
│   ├── notifications/        # NotificationBell & NotificationDetailModal
│   └── ui/                   # Reusable primitives (Button, Skeleton, CurrencyInput, ...)
├── hooks/                    # Custom hooks (useAuth, ...)
├── i18n/                     # next-intl request/locale configuration
├── lib/
│   ├── axios/                # Axios client + 401 refresh-token & CSRF interceptors
│   ├── bff/                  # browserApiClient & serverApiClient
│   └── react-query/          # QueryClient config & invalidateDashboardQueries
├── messages/                 # Synced locale JSON files (en.json, vi.json)
├── providers/                # AuthProvider & React Query providers
├── server/                   # Server-side BFF helpers & Redis client
├── types/                    # TypeScript API interfaces & enums
└── utils/                    # getLocalizedName, currency-converter, notification-i18n
```

---

## Running the App

### 1. Configure Environment

Create `frontend/.env.local` (see [`docs/SETUP_GUIDE.md`](../docs/SETUP_GUIDE.md) for all variables):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
BACKEND_API_URL=http://localhost:8080/api/v1
REDIS_URL=redis://localhost:6379
```

### 2. Install & Start

```bash
cd frontend
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build & start
npm run build
npm run start
```

---

## i18n & Styling

- **Internationalization (`next-intl`):** Translation bundles live in `frontend/messages/en.json` and `frontend/messages/vi.json` (synced to `frontend/src/messages/`). Language selection persists in both the `NEXT_LOCALE` cookie and the user's database `UserPreference`. Database entities (Categories & Wallets) use `getLocalizedName(item, locale)` to resolve `nameEn` / `nameVi`.
- **Styling:** Built with **Tailwind CSS v4**, `tw-animate-css`, **shadcn/ui** component patterns, **Lucide React** icons, and **Recharts v3** for dark-mode financial charts.
