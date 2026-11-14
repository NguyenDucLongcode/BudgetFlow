# Kiến Trúc Hệ Thống & Mô Hình BFF (System Architecture & BFF Pattern)

> **Cập nhật lần cuối:** 12/11/2026  
> **Nguồn:** Đọc trực tiếp từ code `frontend/src/lib/bff`, `axio-client.ts`, `server-api-client.ts`, `src/middleware.ts`, `backend/src/main.ts`, không dựa tài liệu cũ.

---

## 1. Tổng Quan Kiến Trúc BFF (Backend-For-Frontend)

BudgetFlow áp dụng mô hình kiến trúc **BFF (Backend-For-Frontend)** với **Next.js 16 App Router**.  
Trình duyệt không gọi trực tiếp API của NestJS Backend mà luôn giao tiếp thông qua Next.js Server Route Handlers (`/api/*`).

### 1.1. Mục Tiêu Thiết Kế
1. **Bảo Mật Tối Đa (Token Isolation):** Access Token không bao giờ được trả về lưu trữ ở `localStorage` hay biến Javascript của trình duyệt nhằm ngăn ngừa triệt để nguy cơ đánh cắp token qua lỗ hổng XSS.
2. **Quản Lý Phiên Tập Trung Phía Server:** Access Token được lưu tại Redis Server BFF theo `deviceId`.
3. **Ẩn Địa Chỉ Hạ Tầng:** URL của backend (`http://localhost:8080/api/v1`) được giữ kín ở phía server, client chỉ biết endpoint `/api/*` trên cùng domain (`http://localhost:3000`).
4. **Tối Ưu Hóa Dữ Liệu:** BFF có khả năng lọc bỏ các trường nhạy cảm trước khi trả về cho UI.
5. **Bảo Vệ CSRF Toàn Tuyến (End-to-End CSRF):** Tự động đồng bộ cookie `XSRF-TOKEN` và header `x-xsrf-token` từ Browser -> BFF -> Backend cho mọi tác vụ thay đổi dữ liệu.

---

## 2. Sơ Đồ Kiến Trúc Thành Phần (Component Architecture)

```text
+-----------------------------------------------------------------------------------+
|                              TRÌNH DUYỆT (BROWSER)                                |
|  - Next.js Client Components (React 19)                                           |
|  - LocalStorage: { 'x-device-id': 'uuid-v4' }                                     |
|  - Cookies: 'refresh_token' (HttpOnly), 'XSRF-TOKEN' (readable)                   |
|  - axiosClient: baseURL='/api', tự động gắn 'x-device-id' & 'x-xsrf-token'        |
+----------------------------------------+------------------------------------------+
                                         |
                                         | 1. HTTP Same-Origin Request (/api/*)
                                         |    Headers: x-device-id, x-xsrf-token
                                         |    Cookies: refresh_token, XSRF-TOKEN
                                         v
+-----------------------------------------------------------------------------------+
|                         NEXT.JS 16 SERVER (BFF LAYER :3000)                       |
|                                                                                   |
|  ┌─────────────────────────────────┐   ┌───────────────────────────────────────┐  |
|  │      App Router Route Handlers  │   │          serverApiClient              │  |
|  │  - /api/auth/login, refresh...  │   │  - Đọc x-device-id từ header request  │  |
|  │  - /api/auth/verify-email       │   │  - Truy xuất AccessToken từ Redis BFF │  |
|  │  - /api/auth/social-session     │   │  - Gắn header Authorization: Bearer   │  |
|  │  - /api/admin/users (Read-only) │   │  - Forward x-xsrf-token & cookies     │  |
|  │  - /api/users/me                │   │  - Chuẩn hóa lỗi qua ApiError         │  |
|  └─────────────────────────────────┘   └───────────────────+───────────────────┘  |
+----------------------+-------------------------------------+----------------------+
                       |                                     |
    Tra cứu Session    | Key: bff:access:device:{id}         | 2. HTTP Forward (/api/v1/*)
    (Token, Role, TTL) |                                     |    Authorization: Bearer <token>
                       v                                     |    x-device-id, x-xsrf-token
        +------------------------------+                     |    Cookies: refresh_token, XSRF-TOKEN
        |        REDIS INSTANCE        |                     v
        |  - BFF Access Sessions       |   +----------------------------------------+
        |  - BE Refresh Token Hashes   |   |         NESTJS BACKEND (:8080)         |
        |  - Rate Limiting Counters    |   |  - Core Security:                      |
        |  - BullMQ Queues (Emails)    |   |    Helmet, CsrfGuard, JwtAuthGuard,    |
        +------------------------------+   |    PoliciesGuard (CASL)                |
                       ^                   |  - Controllers & Business Services     |
                       |                   +-------------------+--------------------+
                       | Lấy Refresh Hash                      |
                       | Gửi Job Mail                          | Prisma ORM 7
                       +---------------------------------------+
                                                               v
                                           +----------------------------------------+
                                           |         POSTGRESQL 16 (:5433)          |
                                           |  - Users, Wallets, Transactions...     |
                                           +----------------------------------------+
```

---

## 3. Sequence Diagram: Luồng Đăng Nhập (Login Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Browser as Trình duyệt (Client)
    participant BFF as Next.js BFF (:3000)
    participant RedisBFF as Redis BFF Store
    participant NestBE as NestJS Backend (:8080)
    participant RedisBE as Redis BE Store
    participant DB as PostgreSQL (:5433)

    User->>Browser: Nhập email, password, bấm Đăng nhập
    Browser->>Browser: Lấy hoặc tạo mới x-device-id trong LocalStorage
    Browser->>BFF: POST /api/auth/login (Header: x-device-id)
    BFF->>NestBE: POST /api/v1/auth/login (Body: credentials, Header: x-device-id)
    NestBE->>DB: Truy vấn user theo email (kiểm tra status, deletedAt)
    DB-->>NestBE: Dữ liệu User
    NestBE->>NestBE: So khớp mật khẩu qua bcrypt
    NestBE->>NestBE: Tạo JWT AccessToken (15m) & JWT RefreshToken (7d/1d)
    NestBE->>RedisBE: Lưu SHA256 hash của RefreshToken (auth:refresh:userId:deviceId)
    NestBE->>DB: Upsert UserSession (userId, deviceId, lastLoginAt)
    NestBE-->>BFF: Trả về { accessToken, deviceId, user }, Set-Cookie: refresh_token (HttpOnly), Set-Cookie: XSRF-TOKEN
    BFF->>RedisBFF: Lưu accessToken vào Redis BFF (Key: bff:access:device:{deviceId}, TTL: 15m)
    BFF-->>Browser: Phản hồi { user, deviceId } (đã loại bỏ accessToken), Forward Set-Cookie
    Browser->>Browser: Cập nhật cache React Query, chuyển hướng người dùng (/admin/dashboard hoặc /dashboard)
```

---

## 4. Sequence Diagram: Luồng Tự Động Cấp Lại Token (Token Refresh Flow)

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Trình duyệt (Client)
    participant BFF as Next.js BFF (:3000)
    participant RedisBFF as Redis BFF Store
    participant NestBE as NestJS Backend (:8080)
    participant RedisBE as Redis BE Store
    participant DB as PostgreSQL (:5433)

    Browser->>BFF: Gửi API nghiệp vụ (ví dụ: GET /api/wallets)
    BFF->>RedisBFF: Lấy AccessToken của deviceId
    RedisBFF-->>BFF: Token đã hết hạn (hoặc null)
    BFF->>NestBE: Gửi GET /api/v1/wallets (với token hết hạn)
    NestBE-->>BFF: HTTP 401 Unauthorized
    BFF-->>Browser: HTTP 401 Unauthorized
    
    Note over Browser: axiosClient Interceptor bắt mã 401, tạm dừng các request khác
    Browser->>BFF: POST /api/auth/refresh (Cookie: refresh_token, Header: x-device-id)
    BFF->>NestBE: POST /api/v1/auth/refresh-token (Cookie: refresh_token, Header: x-device-id)
    NestBE->>NestBE: Verify JWT RefreshToken bằng JWT_REFRESH_SECRET
    NestBE->>RedisBE: Lấy Refresh Token Hash đối chiếu
    NestBE->>DB: Kiểm tra user.tokenVersion và status
    NestBE->>NestBE: Tạo CẶP TOKEN MỚI (Access Token mới + Refresh Token mới)
    NestBE->>RedisBE: Ghi đè SHA256 Hash của Refresh Token mới
    NestBE->>DB: Cập nhật UserSession lastActiveAt
    NestBE-->>BFF: Trả về AccessToken mới, Set-Cookie: refresh_token mới, Set-Cookie: XSRF-TOKEN mới
    BFF->>RedisBFF: Cập nhật AccessToken mới vào Redis BFF
    BFF-->>Browser: HTTP 200 OK, Forward Set-Cookie mới
    Note over Browser: Gửi lại request nghiệp vụ ban đầu với phiên vừa được làm mới
    Browser->>BFF: Gửi lại GET /api/wallets (tự gắn x-xsrf-token nếu là mutation)
    BFF->>NestBE: GET /api/v1/wallets (Header: Bearer <new_token>, x-xsrf-token)
    NestBE-->>BFF: Dữ liệu danh sách ví
    BFF-->>Browser: HTTP 200 OK + Dữ liệu
```

---

## 5. Ranh Giới Trách Nhiệm (Separation of Concerns)

| Tầng | Trách nhiệm chính | Điều cấm / Không thực hiện |
|---|---|---|
| **Trình duyệt (Browser)** | Hiển thị UI, thu nhận tương tác, lưu `x-device-id`, gửi cookie qua request same-origin, tự động gắn `x-xsrf-token`. | Không lưu trữ hay xử lý trực tiếp JWT Access Token. Không gọi trực tiếp backend port 8080. |
| **Next.js BFF Server** | Route trung gian `/api/*`, ánh xạ session từ `deviceId` ra `accessToken`, forward cookie và `x-xsrf-token`, bắt lỗi HTTP. | Không lưu mật khẩu hoặc thực thi logic nghiệp vụ phức tạp của database. |
| **NestJS Backend** | Xử lý toàn bộ logic nghiệp vụ, xác thực mật khẩu, kiểm soát quyền truy cập CASL, kiểm tra CSRF song song, ghi log kiểm toán, quản lý giao dịch DB. | Không phụ thuộc vào trạng thái session của UI. |
| **Redis** | Lưu trữ phân tán: hash refresh token (BE), access token session (BFF), rate limit, queue gửi mail. | Không dùng làm nơi lưu dữ liệu lâu dài thay thế PostgreSQL. |
| **PostgreSQL** | Cơ sở dữ liệu quan hệ chính, bảo đảm tính toàn vẹn dữ liệu tài chính (ACID). | |

---

## 6. Điểm Cần Lưu Ý / Khuyến Nghị Triển Khai

1. **Kết nối Redis trong Môi Trường Triển Khai Docker:**
   - Khi chạy cả Backend và Frontend trong Docker Compose, biến `REDIS_HOST` ở cả hai bên phải đặt là `redis` (tên service trong mạng Docker) thay vì `localhost`.
2. **CSRF Protection Đã Tích Hợp Đầy Đủ:**
   - Client và BFF hiện đã tự động đồng bộ cookie `XSRF-TOKEN` và header `x-xsrf-token`, loại bỏ hoàn toàn nguy cơ bị `CsrfGuard` của backend chặn với mã HTTP 403 Forbidden.
3. **Next.js Edge Middleware (`src/middleware.ts`):**
   - Đã được chuẩn hóa từ `src/proxy.ts`, bảo vệ an toàn toàn bộ các route trang ngoài whitelist trước khi render giao diện.
