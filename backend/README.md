# BudgetFlow Backend

> **Cập nhật lần cuối:** 11/11/2026  
> **Nguồn:** Đọc trực tiếp từ code, không dựa tài liệu cũ.

Backend API cho BudgetFlow, nền tảng quản lý tài chính cá nhân toàn diện. Dự án xây dựng trên nền tảng **NestJS 11**, **TypeScript**, **PostgreSQL** kết hợp **Prisma ORM 7**, **Redis/BullMQ**, **JWT** và **Swagger UI**.

---

## 1. Yêu Cầu Môi Trường

- **Node.js:** Phiên bản 20 trở lên (tương thích NestJS 11).
- **Docker & Docker Compose:** Dùng để chạy PostgreSQL và Redis.
- **Tài khoản SMTP & Google OAuth:** Bắt buộc phải có để ứng dụng vượt qua bước kiểm tra môi trường khi khởi động.

---

## 2. Cấu Hình Biến Môi Trường (Đầy Đủ Theo `env.validation.ts`)

Ứng dụng sử dụng Joi schema (`src/common/configs/env.validation.ts`) để kiểm tra nghiêm ngặt biến môi trường ngay khi khởi động. Nếu thiếu bất kỳ biến nào được đánh dấu **Bắt buộc**, ứng dụng sẽ dừng ngay lập tức.

Tạo file `backend/.env` từ danh sách chuẩn dưới đây:

```dotenv
# ============================================
# 1. CẤU HÌNH ỨNG DỤNG (APP)
# ============================================
NODE_ENV=development
PORT=8080
# HOST=0.0.0.0
# API_PREFIX=api
# API_VERSION=1
# API_VERSIONING_ENABLED=true
# CORS_ORIGIN=http://localhost:3000
# CORS_CREDENTIALS=true

# ============================================
# 2. CƠ SỞ DỮ LIỆU (DATABASE)
# ============================================
# Lưu ý: Cổng PostgreSQL ánh xạ ra máy host qua Docker Compose là 5433
DATABASE_URL="postgresql://postgres:123456@localhost:5433/db_postgres?schema=public"

# ============================================
# 3. REDIS (CACHE / QUEUE / RATE LIMIT)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# 4. JWT & BẢO MẬT
# ============================================
JWT_ACCESS_SECRET=your_jwt_access_secret_key_very_long_and_secure
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_very_long_and_secure
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# 5. GOOGLE OAUTH 2.0 (BẮT BUỘC THEO JOI SCHEMA)
# ============================================
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/auth/google/callback

# ============================================
# 6. CẤU HÌNH EMAIL SMTP (BẮT BUỘC THEO JOI SCHEMA)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=BudgetFlow

# ============================================
# 7. FRONTEND URL
# ============================================
FRONTEND_URL=http://localhost:3000
```

### Bảng Chi Tiết Biến Môi Trường Bắt Buộc

| Tên biến | Kiểu dữ liệu | Mặc định | Bắt buộc | Mô tả |
|---|---|---|---|---|
| `NODE_ENV` | String | `development` | Không | `development`, `production`, hoặc `test` |
| `PORT` | Number | `8080` | Không | Cổng lắng nghe HTTP của Backend API |
| `DATABASE_URL` | String URI | Không | **Có** | Chuỗi kết nối PostgreSQL (port `5433` khi dùng docker host) |
| `REDIS_HOST` | String | Không | **Có** | Địa chỉ máy chủ Redis (ví dụ: `localhost`) |
| `REDIS_PORT` | Number | Không | **Có** | Cổng Redis (mặc định `6379`) |
| `REDIS_PASSWORD` | String | `''` | Không | Mật khẩu Redis nếu có |
| `JWT_ACCESS_SECRET` | String | Không | **Có** | Khóa bí mật ký Access Token |
| `JWT_REFRESH_SECRET` | String | Không | **Có** | Khóa bí mật ký Refresh Token |
| `JWT_ACCESS_EXPIRES_IN` | String | Không | **Có** | Thời hạn Access Token (ví dụ: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | String | Không | **Có** | Thời hạn Refresh Token (ví dụ: `7d`) |
| `GOOGLE_CLIENT_ID` | String | Không | **Có** | Client ID lấy từ Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | String | Không | **Có** | Client Secret lấy từ Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | String URI | Không | **Có** | Callback URL đã đăng ký tại Google Console |
| `SMTP_HOST` | String | Không | **Có** | Máy chủ gửi thư (ví dụ: `smtp.gmail.com`) |
| `SMTP_PORT` | Number | Không | **Có** | Cổng SMTP (thường là `587` cho TLS) |
| `SMTP_USER` | String | Không | **Có** | Tài khoản gửi email |
| `SMTP_PASS` | String | Không | **Có** | Mật khẩu ứng dụng (App Password) của email |
| `SMTP_FROM_EMAIL` | String Email | Không | **Có** | Địa chỉ hiển thị ở trường From |
| `SMTP_FROM_NAME` | String | Không | **Có** | Tên hiển thị ở trường From (ví dụ: `BudgetFlow`) |
| `FRONTEND_URL` | String URI | Không | **Có** | Địa chỉ web frontend để redirect sau OAuth/verify |

---

## 3. Khởi Động Hạ Tầng (Docker Compose)

Từ thư mục gốc dự án (`BudgetFlow`):

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

- **PostgreSQL Container:** Chạy cổng 5432 nội bộ, ánh xạ ra cổng **`5433`** trên máy host.
- **Redis Container:** Chạy cổng 6379 nội bộ và ánh xạ ra cổng **`6379`** trên máy host.

---

## 4. Cài Đặt & Khởi Tạo Cơ Sở Dữ Liệu

Từ thư mục `backend/`:

```bash
# 1. Cài đặt thư viện
npm install

# 2. Sinh Prisma Client vào output tùy biến (backend/generated/prisma)
npx prisma generate

# 3. Chạy migrations cập nhật schema database
npx prisma migrate deploy

# 4. Khởi tạo dữ liệu mẫu (Seed Data)
npm run seed
```

---

## 5. Lệnh Chạy Ứng Dụng Chuẩn Xác

```bash
# Môi trường phát triển (Hot reload)
npm run start:dev

# Kiểm tra lỗi cú pháp (Lint)
npm run lint

# Build mã nguồn production
npm run build

# Chạy bản build Production (LƯU Ý: Chạy đúng file dist/src/main.js)
node dist/src/main.js
# hoặc sửa script "start:prod": "node dist/src/main" trong package.json rồi chạy:
npm run start:prod
```

---

## 6. Địa Chỉ Truy Cập Dịch Vụ Thực Tế

- **API Base URL:** `http://localhost:8080/api/v1`
- **Swagger Documentation:** `http://localhost:8080/api/docs` (chỉ bật khi không ở production)
- **Health Check Indicator:** `http://localhost:8080/health` (không có prefix/version)
- **Prometheus Metrics:** `http://localhost:8080/metrics` và `http://localhost:8080/metrics/json`

---

## 7. Điểm Cần Lưu Ý / TODO

1. **Lệnh `start:prod` trong `package.json`:**
   - Trong `package.json`, script `"start:prod": "node dist/main"` sẽ bị lỗi vì NestJS build ra `dist/src/main.js`. Cần cập nhật script thành `"node dist/src/main.js"`.
2. **Cơ chế CSRF:**
   - Backend sử dụng `CsrfGuard` bảo vệ toàn cục cho các API mutation (`POST`, `PUT`, `PATCH`, `DELETE`). Trừ các route auth có `@SkipCsrf()`, các request nghiệp vụ khác đều bắt buộc có header `x-xsrf-token` khớp cookie `XSRF-TOKEN`.
3. **Cấu hình Prisma Client:**
   - Output của client nằm ở `backend/generated/prisma`, khi import trong code sử dụng alias `generated/prisma/client` hoặc qua cấu hình `tsconfig.json`.
