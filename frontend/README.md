# BudgetFlow Frontend

> **Cập nhật lần cuối:** 12/11/2026  
> **Nguồn:** Đọc trực tiếp từ code `frontend/src/app`, `src/lib/bff`, `src/client`, `src/middleware.ts`, không dựa tài liệu cũ.

Ứng dụng giao diện người dùng và lớp dịch vụ **BFF (Backend-For-Frontend)** cho nền tảng BudgetFlow, được phát triển bằng **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **TanStack React Query v5**, **Zustand** và **Axios**.

---

## 1. Yêu Cầu & Cài Đặt

- **Node.js:** Phiên bản 20 trở lên (khuyến nghị tương thích Next.js 16).
- **npm** hoặc package manager tương đương.
- **Backend NestJS** (chạy tại `http://localhost:8080`) và **Redis** (chạy tại `localhost:6379`) cần được khởi động để thực hiện đăng nhập và lưu trữ phiên BFF.

Từ thư mục `frontend/`:

```bash
npm install
```

---

## 2. Cấu Hình Biến Môi Trường (`.env.local`)

Tạo file `frontend/.env.local` nếu bạn cần ghi đè các giá trị mặc định của hệ thống:

```dotenv
# Địa chỉ Backend NestJS API (được đọc bởi Next.js Server BFF)
BACKEND_API_URL=http://localhost:8080/api/v1

# Cấu hình Redis lưu trữ phiên Access Token của BFF
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=
# REDIS_DB=0
# REDIS_PREFIX=budgetflow:
```

### Bảng Giải Thích Biến Môi Trường

| Tên biến | Mặc định trong code | Phạm vi | Mô tả |
|---|---|---|---|
| `BACKEND_API_URL` | `http://localhost:8080/api/v1` | Server-only | Địa chỉ backend NestJS mà Next.js BFF gọi tới |
| `REDIS_HOST` | `localhost` | Server-only | Địa chỉ máy chủ Redis dùng cho AccessTokenStore |
| `REDIS_PORT` | `6379` | Server-only | Cổng kết nối Redis |
| `REDIS_PASSWORD` | `undefined` | Server-only | Mật khẩu xác thực Redis nếu có |
| `REDIS_DB` | `0` | Server-only | Database index trong Redis |
| `REDIS_PREFIX` | `budgetflow:` | Server-only | Tiền tố cho các khóa Redis của BFF |

> **Lưu ý bảo mật:** Không thêm tiền tố `NEXT_PUBLIC_` cho các biến trên để tránh làm lộ địa chỉ IP nội bộ hoặc thông tin Redis ra phía trình duyệt.

---

## 3. Các Lệnh Thực Thi

```bash
# Chạy môi trường phát triển (Hot reload trên port 3000)
npm run dev

# Kiểm tra cú pháp và quy chuẩn code
npm run lint

# Build mã nguồn production (Sử dụng Webpack engine để tương thích tối đa với SCSS và Windows)
npm run build

# Khởi chạy bản build production
npm run start
```

Sau khi chạy lệnh `npm run dev`, mở trình duyệt tại: [http://localhost:3000](http://localhost:3000).

---

## 4. Danh Sách Tuyến Đường Thực Tế & Trạng Thái

### 4.1. Giao Diện Người Dùng (UI Routes)

| Tuyến đường | Tệp nguồn | Trạng thái | Đánh giá chức năng |
|---|---|---|---|
| `/` | `src/app/page.tsx` | ⚠️ Đang làm | Trang chủ tạm, hiển thị tiêu đề và liên kết điều hướng cơ bản. |
| `/login` | `src/app/(auth)/login/page.tsx` | ✅ Đã xong | Form đăng nhập (Email + Password + Remember Me), tự sinh `x-device-id`, lưu session qua BFF, điều hướng theo quyền. |
| `/register` | `src/app/(auth)/register/page.tsx` | ✅ Đã xong | Form đăng ký tài khoản (Tên, Email, Mật khẩu, Xác nhận mật khẩu), gửi email xác thực. |
| `/dashboard` | `src/app/dashboard/page.tsx` | 🟡 Khung giao diện | Đích đến mặc định cho người dùng thường (USER). Có lời chào, thống kê nhanh (StatCard), card tính năng tài chính và nút đăng xuất. |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | ⚠️ Đang làm | Khung giao diện Dashboard quản trị, chưa gắn API thống kê thực tế. |
| `/admin/users` | `src/app/admin/users/page.tsx` | ✅ Đã xong | Bảng danh sách người dùng quản trị, phân trang, tìm kiếm, lọc theo vai trò và trạng thái tài khoản. |
| `/auth/social-success` | `src/app/auth/social-success/page.tsx` | ✅ Đã xong | Đích nhận callback Google OAuth (`?token=...`), gọi BFF lưu phiên và chuyển hướng theo Role. |
| `/auth/verify-email` | `src/app/auth/verify-email/page.tsx` | ✅ Đã xong | Nhận mã xác thực email (`?token=...`), gọi BFF kích hoạt tài khoản và dẫn về đăng nhập. |
| `/forgot-password` | `src/app/forgot-password/page.tsx` | ✅ Đã xong | Form nhập email quên mật khẩu, phản hồi thông báo trung tính bảo mật. |
| `/reset-password` | `src/app/reset-password/page.tsx` | ✅ Đã xong | Form đặt lại mật khẩu mới với token từ email, xác thực Zod. |
| Các trang tài chính (`/wallets`, `/transactions`, `/budgets`,...) | *Chưa có file* | ❌ Chưa có UI | Sẽ xây dựng UI ở các giai đoạn tiếp theo. |

### 4.2. Các Tuyến Đường BFF Phía Server (Route Handlers)

| Tuyến đường BFF | Method | Backend API đích | Chức năng |
|---|---|---|---|
| `/api/auth/login` | `POST` | `/auth/login` | Đăng nhập tài khoản, lưu Access Token vào Redis BFF, forward cookie `refresh_token` và `XSRF-TOKEN` |
| `/api/auth/refresh` | `POST` | `/auth/refresh-token` | Làm mới Access Token và Refresh Token khi gặp lỗi 401 |
| `/api/auth/logout` | `POST` | `/auth/logout` | Đăng xuất thiết bị hiện tại, xóa session trong Redis BFF |
| `/api/auth/logout-all` | `POST` | `/auth/logout-all` | Đăng xuất toàn bộ các thiết bị |
| `/api/auth/register` | `POST` | `/auth/register` | Đăng ký tài khoản mới |
| `/api/auth/verify-email` | `GET` | `/auth/verify-email` | Xác thực email người dùng qua token |
| `/api/auth/forgot-password` | `POST` | `/auth/forgot-password` | Yêu cầu gửi email đặt lại mật khẩu |
| `/api/auth/reset-password` | `POST` | `/auth/reset-password` | Đặt lại mật khẩu với token |
| `/api/auth/resend-verification-email` | `POST` | `/auth/resend-verification-email` | Gửi lại email kích hoạt tài khoản |
| `/api/auth/social-session` | `POST` | *Internal BFF* | Nhận accessToken từ OAuth Google, tạo và lưu session vào Redis BFF |
| `/api/admin/users` | `GET` | `/admin/users` | Lấy danh sách người dùng cho màn hình Admin (Read-only) |
| `/api/users/me` | `GET` | `/users/me` | Lấy thông tin tài khoản người dùng đang đăng nhập |

---

## 5. Cơ Chế Bảo Mật & CSRF Tích Hợp

1. **Cơ chế CSRF (Double Submit Cookie):**
   - Backend NestJS kích hoạt `CsrfGuard` toàn cục (sinh cookie `XSRF-TOKEN` với `httpOnly: false, sameSite: lax`).
   - Browser client (`axio-client.ts`): Tự động đọc cookie `XSRF-TOKEN` bằng helper `getCookie('XSRF-TOKEN')` và đính kèm header `x-xsrf-token` cho toàn bộ các request mutation (`POST`, `PUT`, `PATCH`, `DELETE`).
   - Server BFF (`server-api-client.ts`): Đọc cookie hoặc header `x-xsrf-token` từ request của client và forward sang Backend NestJS.
2. **Next.js Middleware (`src/middleware.ts`):**
   - Kiểm tra sự tồn tại của cookie `refresh_token`.
   - Whitelist các tuyến đường công khai: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/verify-email`, `/auth/social-success`.
   - Chặn và chuyển hướng ngay về `/login` nếu người dùng chưa xác thực truy cập vào các trang được bảo vệ.
3. **Session Store An Toàn:**
   - Trình duyệt không lưu trữ JWT Access Token trong `localStorage` hay cookie không mã hóa.
   - Access Token được lưu tập trung trong Redis BFF theo cặp khóa `device_id` và chỉ được tiêm vào header `Authorization: Bearer <token>` từ phía Server BFF khi gọi sang Backend.

---

## 6. Điểm Cần Lưu Ý / TODO Cho Frontend

1. **Xây dựng UI cho các module nghiệp vụ tài chính:**
   - Cần bổ sung UI cho Quản lý Ví (`/wallets`), Giao dịch thu chi (`/transactions`), Ngân sách (`/budgets`), Danh mục (`/categories`) trên nền tảng khung `/dashboard` đã có.
2. **Đồng bộ Next.js 16 Proxy Convention:**
   - Next.js 16.2 khuyến nghị sử dụng quy ước file `src/proxy.ts` (export function `proxy`) thay cho `src/middleware.ts`. Cả hai hiện đều hoạt động hoàn chỉnh, nhưng việc chuyển đổi hoàn toàn sang `proxy.ts` trong tương lai sẽ loại bỏ cảnh báo deprecation khi build.
3. **Thư mục mẫu `public/ui`:**
   - Đã được cấu hình loại trừ (`exclude: ["public"]`) trong `tsconfig.json` để tránh xung đột kiểu dữ liệu với ứng dụng Next.js chính.
