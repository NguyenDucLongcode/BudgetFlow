# BudgetFlow

![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11.1-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Session-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Project Overview

**BudgetFlow** is a comprehensive personal finance management platform designed to help individuals track cash flow, manage multi-currency wallets, enforce budgets, monitor savings goals and debts, and automate recurring transactions with real-time synchronization and interactive financial analytics.

Built with a decoupled **Next.js App Router (BFF)** frontend and a modular **NestJS** backend, BudgetFlow prioritizes security (server-side token storage in Redis, CSRF Double Submit Cookie, CASL RBAC), developer ergonomics, and internationalized user experience (English & Vietnamese).

---

## Key Features

- **Secure Authentication (BFF Pattern, JWT, CSRF Protection):** Access tokens are stored server-side in Redis via Next.js Route Handlers (Backend-for-Frontend), never exposed to browser JavaScript. Protected with `HttpOnly` refresh cookies, `XSRF-TOKEN` Double Submit validation, Google OAuth 2.0, and CASL policy guards.
- **Multi-Currency Wallet Management:** Create and manage Cash, Bank, E-Wallet, Credit Card, and Investment accounts with default wallet selection, archiving, and bilingual category/wallet naming (`nameVi` / `nameEn`).
- **Advanced Transactions & Automation:** Income, Expense, and Transfer tracking with tag support, file attachments, scheduled **Recurring Transactions** (`@Cron` job), and **real-time WebSocket notifications** via Socket.IO.
- **Budgets, Goals & Debts Tracking:** Monthly budget allocation with overspend alerts, savings goal contributions, and loan/debt repayment tracking.
- **Interactive Data Visualization:** Financial Reports (`/reports`) powered by **Recharts** featuring daily cashflow `AreaChart` with dark-mode custom tooltips, category spending `PieChart`, monthly spending allocation breakdown (Living vs. Debt vs. Goal Savings), and Top 5 largest expenses.
- **Full Internationalization (i18n):** Seamless runtime switching between **English (`en`)** and **Vietnamese (`vi`)** powered by `next-intl` and bilingual database fields.

---

## Tech Stack Summary

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts v3 |
| **State & Data Fetching** | TanStack React Query v5, Axios (with BFF interceptors), Zustand, React Hook Form + Zod |
| **Backend** | NestJS 11, TypeScript, Prisma ORM, CASL (RBAC), BullMQ, `@nestjs/schedule` |
| **Database & Cache** | PostgreSQL 15, Redis (session/token store, caching, queues) |
| **Realtime & Notifications** | Socket.IO (`@nestjs/platform-socket.io` & `socket.io-client`), Nodemailer (SMTP) |
| **Observability & Infra** | Docker Compose, Prometheus, Grafana, Swagger / OpenAPI |
| **i18n** | `next-intl` (`en` / `vi`) + bilingual Prisma schema (`nameVi`, `nameEn`) |

---

## Documentation Links

- [`Backend README`](./backend/README.md) — NestJS modules, environment variables, Prisma migrations, seeding, and Swagger API docs.
- [`Frontend README`](./frontend/README.md) — Next.js App Router, BFF architecture, directory structure, i18n, and styling.
- [`Architecture`](./docs/ARCHITECTURE.md) — End-to-end system architecture, BFF authentication flow, CSRF, Redis, and WebSocket + Cron realtime sync.
- [`Setup Guide`](./docs/SETUP_GUIDE.md) — Step-by-step local development setup with Docker, Postgres, Redis, and seed scripts.
- [`Database Schema`](./docs/DATABASE.md) — Entity Relationship Diagram (Mermaid ERD) and table relationships.
