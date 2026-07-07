# BudgetFlow Backend API Documentation

> **Version:** 1.0.0  
> **Last Updated:** 2025  
> **Base URL:** `http://localhost:3000/api/v1` (configurable via `VERSION_API`)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints](#api-endpoints)
   - [Auth Module](#auth-module)
   - [Users Module](#users-module)
   - [Health Module](#health-module)
4. [Data Models](#data-models)
5. [Security Features](#security-features)
6. [Configuration](#configuration)
7. [Error Handling](#error-handling)
8. [Development Setup](#development-setup)

---

## 🏗 Architecture Overview

### Tech Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| **Framework**  | NestJS 11.x                          |
| **Language**   | TypeScript 5.x                       |
| **Database**   | PostgreSQL + Prisma ORM              |
| **Cache**      | Redis (ioredis)                      |
| **Auth**       | JWT (Access + Refresh) + Passport.js |
| **Email**      | Nodemailer + Handlebars templates    |
| **Validation** | class-validator + class-transformer  |
| **Docs**       | Swagger/OpenAPI 3.0                  |
| **Monitoring** | Prometheus metrics                   |

### Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── configs/           # Configuration files
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Global guards
│   ├── interfaces/        # TypeScript interfaces
│   ├── utils/             # Helper functions
│   └── constants/         # Application constants
├── modules/               # Feature modules
│   ├── auth/              # Authentication & Authorization
│   ├── user/              # User management
│   ├── redis/             # Redis cache service
│   └── health/            # Health checks
├── email/                 # Email module
├── prisma/                # Prisma service & schema
└── main.ts                # Application entry point
```

### Module Dependencies

```mermaid
graph TD
    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> EmailModule
    AppModule --> RedisModule
    AppModule --> HealthModule

    AuthModule --> UsersModule
    AuthModule --> EmailModule
    AuthModule --> RedisModule
    AuthModule --> PrismaModule
    AuthModule --> JwtModule
    AuthModule --> PassportModule
```

---

## 🔐 Authentication & Authorization

### Token Strategy

| Token Type        | Algorithm | Expiry          | Storage                 | Use Case          |
| ----------------- | --------- | --------------- | ----------------------- | ----------------- |
| **Access Token**  | HS256     | 15 min (config) | Memory / Header         | API Authorization |
| **Refresh Token** | HS256     | 7 days (config) | HttpOnly Cookie + Redis | Token Renewal     |

### Token Payload (JwtPayload)

```typescript
interface JwtPayload {
  sub: string; // User ID (UUID)
  email: string; // User email
  role: Role; // USER | ADMIN
  tv: number; // Token Version (for revocation)
}
```

### Device-Based Sessions

- Each login binds to a **deviceId** (sent via `X-Device-Id` header)
- Refresh tokens stored in Redis with key: `refresh:{userId}:{deviceId}`
- Supports **multiple concurrent sessions** per user
- `logout-all` increments `tokenVersion` → invalidates all tokens

### Google OAuth 2.0

| Config                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID                              |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret                                 |
| `GOOGLE_CALLBACK_URL`  | Callback URL (e.g., `/api/v1/auth/google/callback`) |
| `state` param          | Used to pass `deviceId` for session binding         |

**Flow:**

```
GET /auth/google                    → Redirect to Google
GET /auth/google/callback?state=xxx → Google redirects back
                                     → Creates/links account
                                     → Issues tokens
                                     → Redirects to frontend with accessToken
```

### Guards & Decorators

| Guard/Decorator     | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `JWTAuthGuard`      | Validates access token, skips `@Public()` routes |
| `GoogleAuthGuard`   | Initiates Google OAuth flow                      |
| `@Public()`         | Marks endpoint as public (no auth required)      |
| `@CurrentUser()`    | Extracts current user from request               |
| `@ApiAccessToken()` | Swagger decorator for Bearer token               |

---

## 📡 API Endpoints

### Auth Module (`/api/v1/auth`)

#### **POST** `/auth/register`

Register a new user with email verification.

**Headers:** `X-Device-Id: <uuid>`

**Request:**

```json
{
  "name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "StrongPass123@",
  "confirmPassword": "StrongPass123@"
}
```

**Response (201):**

```json
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "role": "USER",
    "isActive": false,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Validation Rules:**

- `name`: Required, string
- `email`: Required, valid email format
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- `confirmPassword`: Must match `password`

---

#### **POST** `/auth/login`

Authenticate with email/password.

**Headers:** `X-Device-Id: <uuid>`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "StrongPass123@"
}
```

**Response (200):**

```json
{
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "15m",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Nguyen Van A",
      "role": "USER"
    }
  }
}
```

**Cookies Set:**

- `refresh_token` (HttpOnly, Secure, SameSite=Strict, 7 days)

**Errors:**

- `400` - Missing deviceId
- `401` - Invalid credentials / OAuth account / Email not verified

---

#### **POST** `/auth/refresh-token`

Rotate access & refresh tokens.

**Headers:**

- `X-Device-Id: <uuid>`
- `Cookie: refresh_token=<token>`

**Response (200):**

```json
{
  "message": "Refresh token success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": "15m",
    "user": { ... }
  }
}
```

**Security:** Verifies refresh token hash in Redis + tokenVersion match

---

#### **POST** `/auth/logout`

Logout from current device.

**Headers:**

- `Authorization: Bearer <accessToken>`
- `X-Device-Id: <uuid>`

**Response (200):**

```json
{ "message": "Logout successful" }
```

---

#### **POST** `/auth/logout-all`

Logout from all devices (revokes all tokens).

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{ "message": "Logout all devices successfully" }
```

---

#### **GET** `/auth/sessions`

List active sessions for current user.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{
  "data": [
    {
      "deviceId": "uuid",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "lastLoginAt": "2025-01-15T10:30:00.000Z",
      "lastActiveAt": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

---

#### **DELETE** `/auth/sessions/:deviceId`

Revoke specific session.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{ "message": "Session revoked" }
```

---

#### **GET** `/auth/verify-email?token=<token>`

Verify email address (click link in email).

**Response (200):**

```json
{ "message": "Xác thực email thành công. Bạn có thể đăng nhập." }
```

---

#### **POST** `/auth/resend-verification-email`

Resend verification email.

**Request:**

```json
{ "email": "user@example.com" }
```

---

#### **POST** `/auth/forgot-password`

Request password reset.

**Request:**

```json
{ "email": "user@example.com" }
```

**Response (200):**

```json
{
  "message": "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu."
}
```

---

#### **POST** `/auth/reset-password`

Reset password with token from email.

**Request:**

```json
{
  "token": "reset-token-from-email",
  "password": "NewStrongPass123@",
  "confirmPassword": "NewStrongPass123@"
}
```

**Response (200):**

```json
{ "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." }
```

---

#### **GET** `/auth/google`

Initiate Google OAuth login.

**Query:** `?deviceId=<uuid>`

**Redirects to:** Google OAuth consent screen

---

#### **GET** `/auth/google/callback`

Google OAuth callback.

**Query:** `?code=xxx&state=<deviceId>`

**Redirects to:** `${FRONTEND_URL}/auth/social-success?token=<accessToken>`

---

### Users Module (`/api/v1/users`)

All endpoints require authentication (`Authorization: Bearer <token>`).

#### **POST** `/users`

Create new user (Admin only).

**Request:**

```json
{
  "email": "newuser@example.com",
  "password": "StrongPass123@",
  "name": "New User",
  "role": "USER"
}
```

---

#### **GET** `/users`

List all users.

**Response (200):**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

---

#### **GET** `/users/me`

Get current user profile.

**Response (200):**

```json
{
  "message": "Get profile successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "isActive": true,
    "provider": null,
    "timezone": "UTC",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### **GET** `/users/:id`

Get user by ID.

---

#### **PATCH** `/users/:id`

Update user.

**Request:**

```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

---

#### **DELETE** `/users/:id`

Delete user.

---

#### **PATCH** `/users/:id/toggle-active`

Activate/deactivate user.

---

#### **GET** `/users/count`

Get total user count.

---

### Health Module (`/api/v1/health`)

#### **GET** `/health`

Basic health check.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

---

## 🗄 Data Models

### User Model (Prisma)

```prisma
model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  password              String?   // Null for OAuth users
  name                  String
  role                  Role      @default(USER)
  isActive              Boolean   @default(false)
  provider              String?   // "google", "github"
  providerId            String?   // OAuth provider user ID
  avatar                String?   // Profile picture URL
  timezone              String    @default("UTC")
  tokenVersion          Int       @default(0)  // For token revocation
  verifyToken           String?
  verifyTokenExpiresAt  DateTime?
  verifiedAt            DateTime?
  resetPasswordToken    String?
  resetPasswordExpiresAt DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  sessions              UserSession[]
}

enum Role {
  USER
  ADMIN
}
```

### UserSession Model

```prisma
model UserSession {
  id            String   @id @default(uuid())
  userId        String
  deviceId      String
  userAgent     String?
  ipAddress     String?
  lastLoginAt   DateTime @default(now())
  lastActiveAt  DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId])
  @@index([userId])
}
```

---

## 🛡 Security Features

| Feature                   | Implementation                                          |
| ------------------------- | ------------------------------------------------------- |
| **Password Hashing**      | bcrypt (cost: 10)                                       |
| **Token Storage**         | Refresh tokens hashed (SHA-256) in Redis                |
| **Token Rotation**        | New refresh token on each refresh                       |
| **Token Revocation**      | `tokenVersion` increment on logout-all / password reset |
| **HttpOnly Cookies**      | Refresh token in secure cookie                          |
| **SameSite**              | Strict (CSRF protection)                                |
| **Rate Limiting**         | Nodemailer pool (5 connections, 100 msg/conn)           |
| **Email Verification**    | 24h expiry token                                        |
| **Password Reset**        | 1h expiry token                                         |
| **OAuth Account Linking** | Links by email if no provider exists                    |

### Security Headers (Helmet)

Configured in `helmet.config.ts`:

- CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

---

## ⚙ Configuration

### Environment Variables (`.env`)

```env
# App
NODE_ENV=development
PORT=3000
VERSION_API=api/v1
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/budgetflow?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=BudgetFlow
SMTP_FROM_EMAIL=noreply@budgetflow.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

### Email Templates

Located in `src/email/templates/`:

- `verify-email.hbs`
- `reset-password.hbs`
- `welcome.hbs`

---

## ❌ Error Handling

### Standard Error Response

```json
{
  "statusCode": 401,
  "message": "Token đã hết hạn, vui lòng đăng nhập lại.",
  "error": "Unauthorized"
}
```

### Common HTTP Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Created                                  |
| 204  | No Content                               |
| 400  | Bad Request (validation)                 |
| 401  | Unauthorized (invalid/expired token)     |
| 403  | Forbidden (inactive user, revoked token) |
| 404  | Not Found                                |
| 409  | Conflict (duplicate email)               |
| 429  | Too Many Requests                        |
| 500  | Internal Server Error                    |

### Validation Errors (400)

```json
{
  "statusCode": 400,
  "message": ["Email không hợp lệ", "Mật khẩu phải chứa ít nhất 8 ký tự..."],
  "error": "Bad Request"
}
```

---

## 🚀 Development Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma migrate dev
pnpm prisma generate

# Start development server
pnpm start:dev
```

### Useful Commands

```bash
# Build for production
pnpm build

# Start production
pnpm start:prod

# Run tests
pnpm test
pnpm test:cov
pnpm test:e2e

# Lint & Format
pnpm lint
pnpm format

# Prisma Studio
pnpm prisma studio

# Database seed
pnpm seed
```

### Docker (Optional)

```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 📚 API Documentation (Swagger)

Access interactive docs at:

```
http://localhost:3000/api/docs
```

### Swagger Tags

| Tag            | Description                    |
| -------------- | ------------------------------ |
| Authentication | Login, register, tokens, OAuth |
| Users          | User management                |
| Health         | Health checks                  |

---

## 🔄 Token Flow Diagrams

### Login Flow

```
Client                          Server
  │                                │
  ├─ POST /auth/login ────────────►│
  │   {email, password}            │
  │   Header: X-Device-Id          │
  │                                │
  │◄──── 200 OK + Access Token ────┤
  │   Cookie: refresh_token        │
  │   Redis: refresh:{userId}:{deviceId} = hash(refreshToken)
  │                                │
```

### Token Refresh Flow

```
Client                          Server
  │                                │
  ├─ POST /auth/refresh-token ────►│
  │   Header: X-Device-Id          │
  │   Cookie: refresh_token        │
  │                                │
  │   1. Verify JWT (refresh)      │
  │   2. Check Redis hash match    │
  │   3. Check tokenVersion match  │
  │   4. Issue new access+refresh  │
  │   5. Update Redis + Cookie     │
  │                                │
  │◄──── 200 OK + New Tokens ──────┤
```

### Logout All Flow

```
Client                          Server
  │                                │
  ├─ POST /auth/logout-all ───────►│
  │   Header: Authorization        │
  │                                │
  │   1. Get all user sessions     │
  │   2. Delete all Redis keys     │
  │   3. Delete all UserSessions   │
  │   4. Increment tokenVersion    │
  │   5. Clear cookie              │
  │                                │
  │◄──── 200 OK ───────────────────┤
```

---

## 📝 Changelog

### v1.0.0 (2025-01-15)

- ✅ Authentication module (JWT + Refresh + OAuth)
- ✅ User management module
- ✅ Email verification & password reset
- ✅ Device-based session management
- ✅ Redis token storage with rotation
- ✅ Swagger documentation
- ✅ Health checks
- ✅ Security hardening (Helmet, CORS, Rate limiting)

---

## 📄 License

MIT License - BudgetFlow Team
