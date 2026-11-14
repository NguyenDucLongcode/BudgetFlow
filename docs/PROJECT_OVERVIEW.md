# Báo Cáo Tổng Quan Dự Án BudgetFlow (Project Overview)

> **Cập nhật lần cuối:** 12/11/2026  
> **Nguồn:** Đọc trực tiếp từ code NestJS backend, Next.js frontend, Prisma schema và các tệp cấu hình thực tế, không dựa tài liệu cũ.

---

## 1. Giới thiệu và Mục tiêu Dự án

BudgetFlow là nền tảng quản lý tài chính cá nhân toàn diện, kết hợp mô hình kiến trúc hiện đại giữa **Backend NestJS 11** và **Frontend Next.js 16 (App Router)** hoạt động theo mô hình **BFF (Backend-For-Frontend)**.

Dự án hỗ trợ quản lý đa ví, theo dõi giao dịch thu/chi/chuyển khoản, danh mục đa cấp, ngân sách cảnh báo chi tiêu, mục tiêu tiết kiệm, quản lý công nợ, giao dịch định kỳ, hệ thống thông báo, gắn thẻ (tags), bảo mật nâng cao (RBAC/CASL, CSRF Double-Submit, Rate Limiting, Audit Log) và trang quản trị hệ thống (Admin Portal).

---

## 2. Tech Stack Thực Tế

### Backend (NestJS API)
| Thành phần | Công nghệ / Thư viện | Ghi chú từ mã nguồn |
|---|---|---|
| **Framework** | NestJS 11.1.27 + Express | Kiến trúc module, Global Prefix `/api`, URI versioning `/v1` |
| **Ngôn ngữ** | TypeScript 5.9.3 | Node.js 20+ |
| **Database & ORM** | PostgreSQL 16 + Prisma ORM 7.8.0 | Adapter `@prisma/adapter-pg`, custom output client `backend/generated/prisma` |
| **Cache & Queue** | Redis (ioredis 5.11.1) + BullMQ 5.79.2 | Quản lý refresh token hash, rate limit, hàng đợi gửi email nền |
| **Xác thực & Ủy quyền** | JWT (Passport-JWT, Passport-Google-OAuth20), CASL 6.8 (`@casl/ability`, `@casl/prisma`) | RBAC (Role USER/ADMIN) + ABAC/CASL Policies, Token Version revocation |
| **Bảo mật** | Helmet 8.2, Cookie-Parser 1.4, Custom CsrfGuard (Double Submit Cookie), Throttler 6.5, Sanitize-HTML | Strict CORS, Rate Limit theo Redis, CSRF token bắt buộc cho mutation |
| **Email & Mẫu** | Nodemailer 9.0 + Handlebars templates | Tích hợp `@nestjs-modules/mailer`, hàng đợi xử lý email qua Redis |
| **Tài liệu & Giám sát** | Swagger/OpenAPI 11.4, Prometheus (`@willsoto/nestjs-prometheus`), Terminus Health Check | Swagger tại `/api/docs` (chỉ bật ở dev/staging), `/health`, `/metrics`, `/metrics/json` |

### Frontend (Next.js App Router + BFF)
| Thành phần | Công nghệ / Thư viện | Ghi chú từ mã nguồn |
|---|---|---|
| **Framework** | Next.js 16.2.10 (App Router) | Chạy mô hình BFF (`/api/*`), Middleware Route Guard |
| **Giao diện & UI** | React 19.2.4, Tailwind CSS 4.3.3, SCSS, Lucide React | Hệ thống UI components tự xây dựng (`Button`, `Card`, `TextField`, `StatCard`,...) |
| **Quản lý State** | TanStack React Query v5.101.2, Zustand 5.0.14 | Caching API client, UI State |
| **Form & Validation** | React Hook Form 7.82 + Zod 4.4.3 | Xác thực dữ liệu 2 đầu (Client & Server BFF) |
| **HTTP Client** | Axios 1.18.1 | Gồm `axiosClient` (Browser -> BFF) và `serverApiClient` (BFF -> Backend) |
| **BFF Session Store** | Redis (ioredis 5.11.1) | Lưu trữ Access Token theo Device ID tại Redis phía Next.js server |

---

## 3. Cổng (Port) và Mạng Thực Tế

| Dịch vụ | Host | Cổng Host | Cổng Container | Ghi chú kết nối |
|---|---|---|---|---|
| **Backend API** | `0.0.0.0` / `localhost` | **8080** | 8080 | Base URL: `http://localhost:8080/api/v1`<br/>Swagger: `http://localhost:8080/api/docs`<br/>Health: `http://localhost:8080/health` |
| **Frontend App** | `localhost` | **3000** | 3000 | App URL: `http://localhost:3000`<br/>BFF Route: `http://localhost:3000/api/*` |
| **PostgreSQL** | `localhost` / `postgres` | **5433** | 5432 | Mapped cổng máy host là `5433` trong `docker-compose.yml`<br/>`DATABASE_URL="postgresql://postgres:123456@localhost:5433/db_postgres?schema=public"` |
| **Redis** | `localhost` / `redis` | **6379** | 6379 | Dùng chung cho cả Backend (Token/Queue/RateLimit) và Frontend BFF (Session Store) |

---

## 4. Kiến Trúc Hệ Thống Tổng Thể

```text
                           +-------------------------------------------------------------+
                           |                     TRÌNH DUYỆT (BROWSER)                  |
                           |  - UI Client: React 19 / React Query / Zustand              |
                           |  - Storage: localStorage: 'x-device-id' (UUID)              |
                           |  - Cookies: 'refresh_token' (HttpOnly), 'XSRF-TOKEN'        |
                           +------------------------------+------------------------------+
                                                          |
                                          HTTP /api/*     |  (Same-Origin)
                                          (x-device-id)   v  (x-xsrf-token tự động gắn)
                           +-------------------------------------------------------------+
                           |             NEXT.JS 16 SERVER (BFF LAYER :3000)             |
                           |  - Route Handlers: /api/auth/*, /api/admin/*, /api/users/*  |
                           |  - Tra cứu AccessToken từ Redis BFF theo deviceId           |
                           |  - Gắn Bearer Token & forward cookies/x-xsrf-token          |
                           +---------------+------------------------------+--------------+
                                           |                              |
                   Redis Key:              |                              | HTTP /api/v1/*
                   bff:access:device:{id}  v                              v (Bearer + x-device-id + x-xsrf-token)
                              +--------------------------+  +----------------------------+
                              |      REDIS INSTANCE      |  |     NESTJS BACKEND (:8080) |
                              |   - BFF Access Sessions  |  |  - Global Guards:          |
                              |   - BE Refresh Hashes    |  |    JwtAuth, CsrfGuard,     |
                              |   - Rate Limiting        |  |    PoliciesGuard, Throttler|
                              |   - BullMQ Mail Queues   |  |  - Controllers & Services  |
                              +--------------------------+  +--------------+-------------+
                                                                           |
                                                                           v
                                                            +----------------------------+
                                                            |     POSTGRESQL (:5433)     |
                                                            |  - Schema 14 Models        |
                                                            |  - Prisma ORM 7            |
                                                            +----------------------------+
```

---

## 5. Danh Sách Module & Trạng Thái Chi Tiết

### A. Phía Backend (NestJS)

| Module | Trạng thái | Chi tiết triển khai trong mã nguồn |
|---|---|---|
| **AuthModule** | ✅ Đã xong | Đăng nhập (`/auth/login`), Cấp lại token (`/auth/refresh-token`), Đăng ký (`/auth/register`), Đăng xuất (`/auth/logout`, `/auth/logout-all`), Xác thực email (`/auth/verify-email`, `/auth/resend-verification-email`), Quên & Đặt lại mật khẩu (`/auth/forgot-password`, `/auth/reset-password`), Google OAuth callback. Có `@SkipCsrf()`. |
| **CsrfModule** | ✅ Đã xong | `CsrfService`, `CsrfController` (`/csrf/token`, `/csrf/refresh`), `CsrfGuard` đăng ký làm `APP_GUARD` toàn cục (Double Submit Cookie pattern). |
| **UsersModule (User & Admin)** | ✅ Đã xong | `UsersController` (`/users/me`, đổi mật khẩu, avatar, quản lý sessions). `AdminsController` (`/admin/dashboard`, danh sách user, cập nhật, toggle-active, revoke sessions). |
| **WalletModule** | ✅ Đã xong | CRUD ví tiền (`/wallets`), phân trang, đặt ví mặc định (`/wallets/:id/set-default`), tính số dư, hỗ trợ đa loại ví (`CASH`, `BANK`, `E_WALLET`, `CREDIT`, `INVESTMENT`). |
| **TransactionModule** | ✅ Đã xong | CRUD giao dịch thu/chi/chuyển khoản (`/transactions`), thống kê (`/transactions/statistics`), đính kèm tệp (`/transactions/:id/attachments`), gán thẻ (`/transactions/:id/tags`). Tự động cập nhật số dư ví và chi tiêu ngân sách. |
| **CategoryModule** | ✅ Đã xong | CRUD danh mục thu/chi (`/categories`), hỗ trợ danh mục cha-con đa cấp (`parentId`), danh mục hệ thống mặc định (`isSystem`). |
| **BudgetModule** | ✅ Đã xong | Quản lý ngân sách (`/budgets`), chu kỳ (tháng, quý, năm, tùy biến), tính toán đã tiêu (`spent`), ngưỡng cảnh báo (`alertThreshold`), thống kê tổng quan (`/budgets/summary`). |
| **RecurringTransactionModule** | ✅ Đã xong | Quản lý giao dịch lặp định kỳ (`/recurring-transactions`), tần suất (ngày, tuần, tháng, năm), tạm dừng/kích hoạt (`pause`/`resume`), chạy thủ công (`mark-run`). |
| **GoalModule** | ✅ Đã xong | Quản lý mục tiêu tiết kiệm (`/goals`), nạp/rút tiền (`deposit`/`withdraw`), tạm dừng/tiếp tục (`pause`/`resume`), quản lý khoản đóng góp (`contributions`) và thống kê tiến độ. |
| **DebtModule & DebtPaymentModule** | ✅ Đã xong | Quản lý khoản vay/nợ (`/debts`), lãi suất, hạn trả, tổng kết nợ (`/debts/summary`), theo dõi các đợt thanh toán từng phần (`/debt-payments`). |
| **TagModule** | ✅ Đã xong | Quản lý nhãn giao dịch (`/tags`), tạo hàng loạt (`bulk`), gợi ý autocomplete, thống kê thẻ phổ biến (`popular`). |
| **UserPreferenceModule** | ✅ Đã xong | Quản lý tùy chọn cá nhân (`/user-preference`): ngôn ngữ, đơn vị tiền tệ mặc định, theme, ngày bắt đầu tuần, định dạng ngày/giờ, cấu hình bật/tắt thông báo. |
| **NotificationModule** | ✅ Đã xong | Quản lý thông báo in-app (`/notifications`): đếm chưa đọc (`unread-count`), đánh dấu đã đọc (`read`, `mark-all-read`), xóa thông báo đã đọc. |
| **Infrastructure / Email / Queue** | ✅ Đã xong | Gửi email kích hoạt, reset mật khẩu qua BullMQ queue và Nodemailer Handlebars template. Có controller test (`/email/*`). |
| **Monitoring (Health & Metrics)** | ✅ Đã xong | Health check Terminus (`/health` ping Prisma), Prometheus metrics (`/metrics`, `/metrics/json`). Exclude global prefix và version neutral. |

### B. Phía Frontend (Next.js)

| Nhóm chức năng / Trang | Đường dẫn | Trạng thái | Đánh giá từ mã nguồn thực tế |
|---|---|---|---|
| **Trang chủ (Landing)** | `/` | ⚠️ Đang làm | Giao diện tạm, hiển thị tiêu đề và link điều hướng đơn giản. |
| **Đăng nhập** | `/login` | ✅ Đã xong | Form Zod validation, lưu `x-device-id`, gọi BFF `POST /api/auth/login`, nhận cookie HttpOnly, điều hướng theo Role (Admin -> `/admin/dashboard`, User -> `/dashboard`). |
| **Đăng ký** | `/register` | ✅ Đã xong | Form đăng ký tài khoản, gửi email xác thực qua BFF `POST /api/auth/register`. |
| **Quên / Đặt lại mật khẩu** | `/forgot-password`, `/reset-password` | ✅ Đã xong | Form nhập email quên mật khẩu và đặt lại mật khẩu với Zod validation, kết nối với BFF route handlers tương ứng. |
| **Xác thực Email** | `/auth/verify-email` | ✅ Đã xong | Trang giao diện đón `?token=...`, gọi BFF kích hoạt tài khoản và dẫn về đăng nhập. |
| **OAuth Callback UI** | `/auth/social-success` | ✅ Đã xong | Trang đón token Google OAuth, gọi BFF `POST /api/auth/social-session` lưu phiên Redis và chuyển hướng theo Role. |
| **User Dashboard** | `/dashboard` | 🟡 Khung giao diện | Khung Dashboard người dùng thường: Lời chào, Quick StatCards, feature cards (ví, giao dịch, ngân sách, mục tiêu), nút đăng xuất. |
| **Admin Dashboard** | `/admin/dashboard` | ⚠️ Đang làm | Trang khung tổng quan admin, chưa kết nối API số liệu thống kê. |
| **Admin Quản lý Users** | `/admin/users` | ✅ Đã xong | Bảng danh sách người dùng, phân trang, bộ lọc (search, role, status), gọi qua BFF `/api/admin/users`. Read-only an toàn. |
| **BFF Route Handlers** | `/api/auth/*`, `/api/admin/users`, `/api/users/me` | ✅ Đã xong | Đầy đủ 10 route handlers bao gồm login, logout, refresh, register, verify-email, forgot-password, reset-password, social-session,... |
| **Quản lý Tài chính Người dùng** | `/wallets`, `/transactions`, `/budgets`, `/goals`, `/debts` | ❌ Chưa có UI | Frontend sẽ xây dựng các trang này trên nền tảng khung `/dashboard` đã có. |

---

## 6. Điểm Đã Hoàn Tất & Các Vấn Đề Tồn Đọng

### A. Các Vấn Đề Đã Sửa Triệt Để
1. **CSRF Protection Đầy Đủ:**
   - Đã thêm request interceptor trong `axio-client.ts` tự động đọc cookie `XSRF-TOKEN` và gắn header `x-xsrf-token`.
   - Đã cập nhật `server-api-client.ts` để forward header/cookie CSRF sang NestJS Backend.
2. **Next.js Middleware Chuẩn Hóa:**
   - Đã chuyển đổi `src/proxy.ts` thành `src/middleware.ts`, cấu hình matcher chuẩn và whitelist đầy đủ các route công khai.
3. **Bổ Sung Toàn Bộ Trang và BFF Handlers Xác Thực Còn Thiếu:**
   - Tạo `/dashboard`, `/auth/social-success`, `/auth/verify-email`, `/forgot-password`, `/reset-password`.
   - Tạo các BFF handlers: `verify-email`, `forgot-password`, `reset-password`, `resend-verification-email`, `social-session`.
4. **Sửa Lỗi Backend Script:**
   - Đã sửa script `"start:prod": "node dist/src/main.js"` trong `backend/package.json`.
5. **Khắc Phục Toàn Diện Build Frontend:**
   - Loại trừ thư mục prototype `public` khỏi `tsconfig.json`.
   - Sửa lỗi component `Badge` (thư mục có dấu cách thừa), lỗi Google Fonts trong môi trường offline, lỗi kiểu TypeScript trong `StatCard`, `UserRow`, `Avatar`, `Admin-Topbar`.
   - Sử dụng Webpack bundler cho `npm run build` để ổn định tối đa với SCSS.

### B. Vấn Đề Cần Người Dùng Quyết Định / Tiếp Tục Triển Khai
1. **Triển khai UI các tính năng tài chính:** Xây dựng màn hình quản lý ví, giao dịch, ngân sách, mục tiêu tiết kiệm, công nợ trên nền tảng khung Dashboard đã tạo.
2. **Quy ước `proxy.ts` vs `middleware.ts`:** Next.js 16.2 khuyến nghị dùng tên file `proxy.ts`. Hiện `middleware.ts` đang hoạt động ổn định (chỉ hiển thị cảnh báo deprecation khi build). Dự án có thể đổi hẳn sang `proxy.ts` khi Next.js chính thức bỏ quy ước cũ.
3. **Admin User Management:** Admin có API toggle-active, revoke sessions, soft-delete user (bảo vệ bằng CASL Policy `Action.Manage, 'User'`). Đây là quyền quản trị tài khoản hợp lệ, không can thiệp vào số dư hay giao dịch riêng tư của người dùng.
