# Chi Tiết Luồng Xác Thực & Bảo Mật (Authentication & Security Flows)

> **Cập nhật lần cuối:** 12/11/2026  
> **Nguồn:** Đọc trực tiếp từ code `AuthController`, `AuthService`, `CsrfService`, `CsrfGuard`, `server-api-client.ts`, `axio-client.ts`, `middleware.ts`, không dựa tài liệu cũ.

---

## 1. Tổng Quan Kiến Trúc Xác Thực & Phiên

Hệ thống kết hợp giữa **Stateful Session tại Redis + Database** và **Stateless JWT Tokens**, vận hành an toàn qua lớp trung gian **BFF (Next.js App Router)**.

### Bảng Thành Phần Khóa
| Thành phần | Đặc tính kỹ thuật | Vị trí lưu trữ | Vai trò |
|---|---|---|---|
| **Access Token** | JWT (HS256), TTL mặc định `15m` (`JWT_ACCESS_EXPIRES_IN`) | Redis BFF (`bff:access:device:{id}`) | Ủy quyền cho các API request từ BFF đến NestJS |
| **Refresh Token** | JWT (HS256), TTL `7d` (remember) hoặc `1d` (`JWT_REFRESH_EXPIRES_IN`) | HttpOnly Cookie `refresh_token` (trình duyệt) + SHA-256 Hash tại Redis BE (`auth:refresh:{userId}:{deviceId}`) | Cấp lại cặp token mới khi Access Token hết hạn |
| **Device ID** | UUID v4 | LocalStorage (`x-device-id`) + Header `x-device-id` | Phân biệt phiên đăng nhập đa thiết bị |
| **CSRF Token** | Random 32 bytes hex (`crypto.randomBytes(32)`) | Cookie `XSRF-TOKEN` (httpOnly: false) + Header `x-xsrf-token` | Chống tấn công CSRF cho các thao tác Mutation |
| **Token Version (`tv`)** | Integer tăng dần (`tokenVersion` trong User) | Cột `tokenVersion` trong DB + Claim `tv` trong JWT | Thu hồi toàn bộ token ngay lập tức (khi đổi mật khẩu hoặc logout-all) |

---

## 2. Xác Nhận Cơ Chế CSRF Của Backend & Tích Hợp Frontend

> **KẾT LUẬN TỪ MÃ NGUỒN THỰC TẾ:**  
> Backend đã cài đặt cơ chế **CSRF Protection ĐẦY ĐỦ** theo mô hình **Double Submit Cookie Pattern**:
> 1. Token được sinh ngẫu nhiên 32-byte qua `CsrfService.generateToken()`.
> 2. Được gửi về client dưới dạng Cookie `XSRF-TOKEN` (`httpOnly: false`, `sameSite: 'lax'`, `path: '/'`).
> 3. Được bảo vệ toàn cục bằng `CsrfGuard` đăng ký dưới dạng `APP_GUARD` trong `GuardModule`.
> 4. `CsrfGuard` kiểm tra toàn bộ HTTP methods: `POST`, `PUT`, `PATCH`, `DELETE`.
> 5. Trích xuất token từ header (`x-xsrf-token`, `x-csrf-token`, `csrf-token`) hoặc body/query `_csrf`.
> 6. Đối chiếu giá trị cookie và header bằng thuật toán an toàn `crypto.timingSafeEqual`.
> 7. Các route auth như `/auth/login`, `/auth/register`... được gắn decorator `@SkipCsrf()` để cho phép đăng nhập trước khi có token.
>
> **TÍCH HỢP TRÊN FRONTEND (Đã hoàn thành):**
> - **Trình duyệt (`axio-client.ts`):** Request Interceptor tự động đọc cookie `XSRF-TOKEN` qua hàm `getCookie('XSRF-TOKEN')` và gắn vào header `x-xsrf-token` cho mọi request `POST`, `PUT`, `PATCH`, `DELETE`.
> - **BFF Server (`server-api-client.ts`):** Trong `createClient()`, tự động đọc cookie hoặc header `x-xsrf-token` từ client gửi đến BFF và forward sang NestJS Backend.

---

## 3. Chi Tiết Từng Luồng (Flow Diagrams)

### 3.1. Luồng Đăng Nhập (Login Flow)

```text
Trình duyệt                   Next.js BFF (:3000)                  NestJS Backend (:8080)             Redis / DB
    |                                 |                                      |                            |
    | 1. POST /api/auth/login         |                                      |                            |
    |    { email, password }          |                                      |                            |
    |    Header: x-device-id          |                                      |                            |
    |-------------------------------->|                                      |                            |
    |                                 | 2. POST /api/v1/auth/login           |                            |
    |                                 |    Header: x-device-id               |                            |
    |                                 |------------------------------------->|                            |
    |                                 |                                      | 3. Validate user password  |
    |                                 |                                      |    status == ACTIVE        |
    |                                 |                                      |--------------------------->| DB User
    |                                 |                                      | 4. Tạo AccessToken (15m)   |
    |                                 |                                      |    Tạo RefreshToken (7d/1d)|
    |                                 |                                      | 5. Hash RefreshToken SHA256|
    |                                 |                                      |    Lưu Redis BE (7d/1d)    |
    |                                 |                                      |    Upsert UserSession DB   |
    |                                 |                                      |--------------------------->| Redis & DB
    |                                 |                                      | 6. Set-Cookie:             |
    |                                 |                                      |    - refresh_token (HttpOnly)|
    |                                 |                                      |    - XSRF-TOKEN (readable) |
    |                                 | 7. Phản hồi kèm AccessToken & cookies|                            |
    |                                 |<-------------------------------------|                            |
    |                                 | 8. Lưu AccessToken vào Redis BFF:    |                            |
    |                                 |    Key: bff:access:device:{deviceId} |                            |
    |                                 |------------------------------------------------------------------>| Redis BFF
    |                                 | 9. Bóc AccessToken ra khỏi payload,  |                            |
    |                                 |    chỉ trả về { deviceId, user }     |                            |
    |                                 |    Forward Set-Cookie về trình duyệt |                            |
    | 10. Trả về { user, deviceId }   |                                      |                            |
    |     Set-Cookie: refresh_token   |                                      |                            |
    |     Set-Cookie: XSRF-TOKEN      |                                      |                            |
    |<--------------------------------|                                      |                            |
    v                                 v                                      v                            v
```

---

### 3.2. Luồng Gọi API Nghiệp Vụ Có CSRF Protection

```text
Trình duyệt                   Next.js BFF (:3000)                  NestJS Backend (:8080)
    |                                 |                                      |
    | 1. POST /api/wallets            |                                      |
    |    Header: x-device-id          |                                      |
    |    Header: x-xsrf-token (tự gắn)|                                      |
    |    Cookie: refresh_token        |                                      |
    |    Cookie: XSRF-TOKEN           |                                      |
    |-------------------------------->|                                      |
    |                                 | 2. Lấy AccessToken từ Redis BFF      |
    |                                 |    qua key: bff:access:device:{id}   |
    |                                 | 3. Gửi request sang Backend:         |
    |                                 |    POST /api/v1/wallets              |
    |                                 |    Header: Authorization: Bearer <at>|
    |                                 |    Header: x-xsrf-token              |
    |                                 |    Cookie: XSRF-TOKEN, refresh_token |
    |                                 |------------------------------------->|
    |                                 |                                      | 4. CsrfGuard kiểm tra:
    |                                 |                                      |    timingSafeEqual(header, cookie)
    |                                 |                                      | 5. JwtAuthGuard kiểm tra:
    |                                 |                                      |    Verify JWT AccessToken
    |                                 |                                      | 6. PoliciesGuard (CASL) kiểm tra
    |                                 |                                      | 7. Thực thi nghiệp vụ & DB
    |                                 | 8. Trả kết quả dữ liệu               |
    |                                 |<-------------------------------------|
    | 9. Phản hồi cho trình duyệt     |                                      |
    |<--------------------------------|                                      |
```

---

### 3.3. Luồng Cấp Lại Token (Refresh Token Rotation Flow)

Khi Access Token hết hạn (Backend trả về 401 Unauthorized):

```text
Trình duyệt                   Next.js BFF (:3000)                  NestJS Backend (:8080)             Redis / DB
    |                                 |                                      |                            |
    | 1. Bắt lỗi 401                  |                                      |                            |
    |    POST /api/auth/refresh       |                                      |                            |
    |    Cookie: refresh_token        |                                      |                            |
    |    Header: x-device-id          |                                      |                            |
    |-------------------------------->|                                      |                            |
    |                                 | 2. POST /api/v1/auth/refresh-token   |                            |
    |                                 |    Forward Cookie & x-device-id      |                            |
    |                                 |------------------------------------->|                            |
    |                                 |                                      | 3. Verify RefreshToken JWT |
    |                                 |                                      | 4. Lấy hash từ Redis BE    |
    |                                 |                                      |    auth:refresh:{uid}:{did}|
    |                                 |                                      |    So sánh SHA-256 hash    |
    |                                 |                                      | 5. Kiểm tra user.status    |
    |                                 |                                      |    payload.tv == user.tv   |
    |                                 |                                      | 6. Tạo cặp Access & Refresh|
    |                                 |                                      |    mới (Token Rotation!)   |
    |                                 |                                      | 7. Ghi đè Hash mới vào Redis|
    |                                 |                                      |    Update UserSession DB   |
    |                                 |                                      |--------------------------->| Redis & DB
    |                                 |                                      | 8. Set-Cookie mới:         |
    |                                 |                                      |    refresh_token,XSRF-TOKEN|
    |                                 | 9. Trả về AccessToken mới            |                            |
    |                                 |<-------------------------------------|                            |
    |                                 | 10. Lưu AccessToken mới vào Redis BFF|                            |
    |                                 |------------------------------------------------------------------>| Redis BFF
    | 11. Forward Set-Cookie mới      |                                      |                            |
    |<--------------------------------|                                      |                            |
    | 12. Gửi lại request ban đầu     |                                      |                            |
    |-------------------------------->|                                      |                            |
```

---

### 3.4. Luồng Đăng Xuất (Logout & Logout All)

#### Đăng xuất thiết bị hiện tại (`/auth/logout`):
1. Client gửi `POST /api/auth/logout` kèm `x-device-id`.
2. Next.js BFF gọi `POST /api/v1/auth/logout`.
3. Backend:
   - Tìm phiên trong bảng `UserSession` bằng `deviceId`.
   - Xóa key Redis `auth:refresh:{userId}:{deviceId}`.
   - Xóa dòng trong bảng `UserSession`.
   - Xóa cookie `refresh_token` (`res.clearCookie`).
   - Xóa cookie `XSRF-TOKEN` (`res.clearCookie`).
4. BFF xóa token trong Redis BFF (`accessTokenStore.remove(deviceId)`).
5. Client xóa `x-device-id` khỏi `localStorage` và xóa sạch cache React Query (`clearAuthState`).

#### Đăng xuất tất cả thiết bị (`/auth/logout-all`):
1. Yêu cầu có `Authorization: Bearer <access_token>`.
2. Backend tăng `user.tokenVersion` (hoặc xóa toàn bộ key Redis của user).
3. Xóa tất cả các bản ghi trong `UserSession` của `userId`.
4. Vì `tokenVersion` trong DB thay đổi, tất cả Access Token và Refresh Token cũ đang lưu hành đều sẽ bị từ chối ở lần gọi tiếp theo.

---

### 3.5. Luồng Xác Thực Email (Verify Email)

1. Khi người dùng đăng ký (`POST /api/auth/register`):
   - Tạo user với `status = PENDING`.
   - Tạo `verifyToken = crypto.randomBytes(32).toString('hex')` với hạn 24 giờ.
   - Đẩy job gửi email vào hàng đợi BullMQ `email-queue`.
   - Worker gửi email chứa đường link: `${FRONTEND_URL}/auth/verify-email?token=${token}`.
2. Khi người dùng click link email:
   - Trình duyệt mở trang `frontend/src/app/auth/verify-email/page.tsx?token=...`.
   - Component gọi BFF `GET /api/auth/verify-email?token=...`.
   - BFF gọi Backend NestJS `GET /api/v1/auth/verify-email?token=...`.
   - Backend đổi `status = ACTIVE`, ghi nhận `verifiedAt`, xóa `verifyToken`.
   - Trang hiển thị thông báo thành công và nút chuyển hướng về `/login`.

---

### 3.6. Luồng Quên & Đặt Lại Mật Khẩu (Forgot / Reset Password)

1. **Yêu cầu khôi phục (`/forgot-password`):**
   - Người dùng nhập email tại `frontend/src/app/forgot-password/page.tsx`.
   - Gọi BFF `POST /api/auth/forgot-password`.
   - Backend sinh `resetToken` (hạn 1 giờ) và gửi email liên kết: `${FRONTEND_URL}/reset-password?token=${token}`.
   - Trả thông báo trung tính bảo mật: "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi".
2. **Đặt mật khẩu mới (`/reset-password`):**
   - Người dùng click link mở `frontend/src/app/reset-password/page.tsx?token=...`.
   - Nhập mật khẩu mới và xác nhận mật khẩu (được kiểm tra qua Zod schema: chữ hoa, chữ thường, số, ký tự đặc biệt, tối thiểu 8 ký tự).
   - Gọi BFF `POST /api/auth/reset-password` -> Backend NestJS `POST /api/v1/auth/reset-password`.
   - Backend cập nhật hash mật khẩu, tăng `tokenVersion` để thu hồi toàn bộ các phiên cũ trên mọi thiết bị, xóa `resetToken`.
   - Hiển thị thông báo thành công và chuyển hướng về `/login`.

---

### 3.7. Luồng Đăng Nhập Google OAuth 2.0 & Social Session BFF

1. Người dùng click Đăng nhập bằng Google trên giao diện.
2. Trình duyệt mở: `GET http://localhost:8080/api/v1/auth/google?state=<deviceId>`.
3. `GoogleAuthGuard` chuyển tiếp người dùng sang Google OAuth Consent Screen.
4. Người dùng chấp thuận, Google gọi callback: `GET /api/v1/auth/google/callback`.
5. Backend NestJS:
   - Liên kết tài khoản hoặc tạo mới user với `status = ACTIVE`.
   - Sinh Access Token và HttpOnly Cookie `refresh_token`, `XSRF-TOKEN`.
   - Chuyển hướng người dùng về Frontend: `${FRONTEND_URL}/auth/social-success?token=${accessToken}`.
6. Trang `frontend/src/app/auth/social-success/page.tsx`:
   - Lấy query param `token`.
   - Lấy hoặc sinh `x-device-id`.
   - Gọi BFF Route Handler `POST /api/auth/social-session` kèm `{ accessToken: token, deviceId }`.
   - BFF lưu `accessToken` vào Redis BFF (`bff:access:device:{deviceId}`).
   - Cập nhật cache React Query với thông tin User Profile.
   - Điều hướng người dùng: `ADMIN` vào `/admin/dashboard`, `USER` vào `/dashboard`.

---

## 4. Điểm Cần Lưu Ý / Khuyến Nghị

1. **Bảo toàn cơ chế CSRF:** Khi viết thêm bất kỳ form hoặc API mutation nào ở phía client, hãy luôn sử dụng `browserApiClient` hoặc `axiosClient` từ `@/src/lib/bff` hoặc `@/src/lib/axios` để đảm bảo header `x-xsrf-token` luôn được tự động đính kèm.
2. **Quản lý phiên Redis BFF:** Khi deploy môi trường production thực tế, cần đảm bảo server Next.js BFF và Backend NestJS có thể truy cập chung instance Redis hoặc hai instance Redis được cấu hình đúng biến môi trường tương ứng.
