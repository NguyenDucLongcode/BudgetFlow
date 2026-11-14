# Tài Liệu API Backend BudgetFlow (Toàn Diện & Chi Tiết)

> **Cập nhật lần cuối:** 11/11/2026  
> **Nguồn:** Đọc trực tiếp từ code controllers, DTOs, guards, không dựa tài liệu cũ.  
> **Base URL Chuẩn:** `http://localhost:8080/api/v1` (Cổng 8080, Global Prefix `api`, Version URI `v1`)  
> **Swagger UI:** `http://localhost:8080/api/docs` (khi `NODE_ENV !== 'production'`)

---

## 1. Quy Chuẩn Kỹ Thuật Chung

### 1.1. Base URL & Versioning
- Mọi endpoint nghiệp vụ đều có dạng: `http://localhost:8080/api/v1/<endpoint>`
- Riêng các endpoint giám sát (Monitoring) được loại trừ khỏi prefix và version:
  - `GET http://localhost:8080/health`
  - `GET http://localhost:8080/metrics`
  - `GET http://localhost:8080/metrics/json`

### 1.2. Cơ Chế Xác Thực & Header Bắt Buộc
- **Access Token:** Gửi qua header `Authorization: Bearer <access_token>` cho mọi endpoint yêu cầu đăng nhập.
- **Device ID:** Gửi qua header `x-device-id: <uuid>` cho các luồng auth (`login`, `refresh-token`, `logout`).
- **CSRF Protection:**
  - Cơ chế: Double Submit Cookie (`XSRF-TOKEN` cookie và header `x-xsrf-token`).
  - Mọi request thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`) đến các module nghiệp vụ (ngoại trừ các endpoint gắn `@SkipCsrf()`) **bắt buộc** phải kèm header `x-xsrf-token` khớp với cookie `XSRF-TOKEN`.

### 1.3. Định Dạng Phản Hồi Chuẩn (Standard Response Format)
Hệ thống sử dụng `ResponseInterceptor` để chuẩn hóa dữ liệu trả về:

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": { ... }
}
```

Khi xảy ra lỗi (qua `AllExceptionsFilter`):
```json
{
  "statusCode": 400,
  "timestamp": "2026-11-11T09:30:00.000Z",
  "path": "/api/v1/auth/login",
  "message": "Validation failed",
  "errors": ["email must be an email"]
}
```

---

## 2. Danh Sách Đầy Đủ Các API Endpoints

### 2.1. Bảo Mật CSRF (`/api/v1/csrf`)
Quản lý mã chống giả mạo request liên trang (Double Submit Cookie).

| Method | Endpoint | Quyền | CSRF | Mô tả |
|---|---|---|---|---|
| `GET` | `/csrf/token` | Public | Skip | Tạo và thiết lập cookie `XSRF-TOKEN`, trả về token |
| `GET` | `/csrf/refresh` | Public | Skip | Làm mới cookie `XSRF-TOKEN` và trả về token mới |

---

### 2.2. Xác Thực & Ủy Quyền (`/api/v1/auth`)
Module quản lý phiên, đăng ký, đăng nhập và khôi phục tài khoản. Tất cả đều có `@SkipCsrf()`.

| Method | Endpoint | Body / Query | Headers | Mô tả |
|---|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password, remember? }` | `x-device-id` | Đăng nhập tài khoản email/mật khẩu, trả về Access Token + set cookie `refresh_token` và `XSRF-TOKEN` |
| `POST` | `/auth/refresh-token` | Không có | `x-device-id`, Cookie: `refresh_token` | Cấp mới Access Token và Refresh Token xoay vòng (Token Rotation) |
| `POST` | `/auth/register` | `{ email, password, confirmPassword, name }` | Không | Đăng ký tài khoản mới, gửi email kích hoạt |
| `POST` | `/auth/logout` | Không có | `x-device-id` | Hủy session thiết bị hiện tại, xóa refresh token trong Redis và xóa cookie |
| `POST` | `/auth/logout-all` | Không có | Bearer Token | Đăng xuất toàn bộ các thiết bị (yêu cầu đăng nhập) |
| `GET` | `/auth/verify-email` | Query: `?token=<verify_token>` | Không | Xác thực tài khoản qua link email |
| `POST` | `/auth/resend-verification-email`| `{ email }` | Không | Gửi lại email xác thực |
| `POST` | `/auth/forgot-password`| `{ email }` | Không | Gửi email yêu cầu đặt lại mật khẩu |
| `POST` | `/auth/reset-password` | `{ token, newPassword, confirmPassword }` | Không | Cập nhật mật khẩu mới bằng reset token |
| `GET` | `/auth/google` | Query: `?state=<deviceId>` | Không | Chuyển hướng tới trang đăng nhập Google OAuth |
| `GET` | `/auth/google/callback` | OAuth Callback Params | Không | Tiếp nhận đăng nhập Google, redirect về `${FRONTEND_URL}/auth/social-success?token=...` |

---

### 2.3. Người Dùng Hiện Tại (`/api/v1/users`)
Quản lý hồ sơ cá nhân và phiên đăng nhập của người dùng.

| Method | Endpoint | Quyền / Guard | CSRF | Mô tả |
|---|---|---|---|---|
| `GET` | `/users/me` | Bearer Token | Bỏ qua (GET) | Lấy thông tin chi tiết tài khoản hiện tại |
| `PATCH`| `/users/me` | Bearer Token | Bắt buộc | Cập nhật tên, múi giờ (`timezone`) |
| `PATCH`| `/users/me/change-password` | Bearer Token | Bắt buộc | Đổi mật khẩu (`currentPassword`, `newPassword`, `confirmPassword`) |
| `PATCH`| `/users/me/avatar` | Bearer Token | Bắt buộc | Tải lên file ảnh đại diện |
| `GET` | `/users/me/sessions` | Bearer Token | Bỏ qua (GET) | Danh sách các phiên đăng nhập đang hoạt động |
| `DELETE`| `/users/me/sessions/:sessionId` | Bearer Token | Bắt buộc | Hủy một phiên đăng nhập cụ thể theo ID |
| `DELETE`| `/users/me/sessions` | Bearer Token | Bắt buộc | Hủy tất cả phiên đăng nhập khác của người dùng |

---

### 2.4. Quản Trị Hệ Thống (`/api/v1/admin`)
Dành riêng cho người dùng có vai trò `ADMIN`.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Không | Thống kê số liệu dashboard tổng quan admin |
| `GET` | `/admin/users` | Query: `page`, `limit`, `search`, `role`, `status` | Danh sách người dùng hệ thống có phân trang |
| `GET` | `/admin/users/:id` | Param: UUID user | Chi tiết thông tin một người dùng |
| `PATCH`| `/admin/users/:id` | `{ name?, role?, status? }` | Cập nhật vai trò/trạng thái người dùng |
| `PATCH`| `/admin/users/:id/toggle-active` | Không | Bật/tắt kích hoạt trạng thái tài khoản |
| `GET` | `/admin/users/:id/sessions` | Param: UUID user | Xem danh sách phiên đăng nhập của user |
| `DELETE`| `/admin/users/:userId/sessions/:sessionId` | Param: userId, sessionId | Buộc đăng xuất một phiên của user |
| `DELETE`| `/admin/users/:id/sessions` | Param: UUID user | Buộc đăng xuất toàn bộ phiên của user |
| `DELETE`| `/admin/users/:id` | Param: UUID user | Xóa mềm người dùng |

---

### 2.5. Ví Tiền (`/api/v1/wallets`)
Quản lý các nguồn tiền của người dùng (`CASH`, `BANK`, `E_WALLET`, `CREDIT`, `INVESTMENT`).

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/wallets` | `{ name, type, initialBalance?, currency?, icon?, color?, bankName?, accountNumber?, accountName?, description? }` | Tạo ví mới (kiểm tra trùng tên theo user) |
| `GET` | `/wallets` | Query: `page`, `limit`, `search`, `type`, `isArchived` | Danh sách ví của người dùng |
| `GET` | `/wallets/:id` | Param: UUID ví | Xem chi tiết thông tin và số dư ví |
| `PATCH`| `/wallets/:id` | Cập nhật thông tin ví | Sửa thông tin ví (tên, icon, color, description...) |
| `DELETE`| `/wallets/:id` | Param: UUID ví | Xóa ví (Soft-delete nếu có giao dịch liên kết) |
| `PATCH`| `/wallets/:id/set-default` | Param: UUID ví | Đặt ví này làm ví mặc định |

---

### 2.6. Giao Dịch (`/api/v1/transactions`)
Quản lý giao dịch thu (`INCOME`), chi (`EXPENSE`) và chuyển khoản (`TRANSFER`).

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/transactions` | `{ type, amount, currency?, date?, categoryId?, walletId?, fromWalletId?, toWalletId?, description?, note? }` | Tạo giao dịch (tự động cộng/trừ số dư ví) |
| `GET` | `/transactions` | Query phân trang, lọc theo date, walletId, categoryId, type, status | Danh sách lịch sử giao dịch |
| `GET` | `/transactions/statistics` | Query: `startDate`, `endDate`, `walletId` | Báo cáo thống kê tổng thu, tổng chi, số dư theo kỳ |
| `GET` | `/transactions/:id` | Param: UUID giao dịch | Chi tiết giao dịch |
| `PATCH`| `/transactions/:id` | Cập nhật số tiền, ví, danh mục | Sửa giao dịch (tự bù trừ điều chỉnh số dư ví) |
| `DELETE`| `/transactions/:id` | Param: UUID giao dịch | Xóa giao dịch (hoàn lại số dư ví tương ứng) |
| `POST` | `/transactions/:id/tags` | `{ tagIds: string[] }` | Gán danh sách thẻ vào giao dịch |
| `GET` | `/transactions/:id/tags` | Param: UUID giao dịch | Lấy danh sách thẻ đã gắn vào giao dịch |
| `PUT` | `/transactions/:id/tags` | `{ tagIds: string[] }` | Thay thế toàn bộ thẻ của giao dịch |
| `DELETE`| `/transactions/:id/tags/:tagId` | Param: transactionId, tagId | Gỡ một thẻ ra khỏi giao dịch |
| `POST` | `/transactions/:id/attachments`| Multipart file upload | Tải tệp/hóa đơn đính kèm giao dịch |
| `GET` | `/transactions/:id/attachments`| Param: UUID giao dịch | Xem danh sách hóa đơn đính kèm |
| `GET` | `/transactions/:id/attachments/:attachmentId` | Param IDs | Chi tiết tệp đính kèm |
| `PATCH`| `/transactions/:id/attachments/:attachmentId` | Cập nhật thông tin | Sửa tên/ghi chú tệp đính kèm |
| `DELETE`| `/transactions/:id/attachments/:attachmentId` | Param IDs | Xóa tệp đính kèm |
| `DELETE`| `/transactions/:id/attachments` | Param: UUID giao dịch | Xóa tất cả tệp đính kèm của giao dịch |

---

### 2.7. Danh Mục Thu Chi (`/api/v1/categories`)
Phân loại các khoản chi tiêu và nguồn thu nhập.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/categories` | `{ name, type, icon?, color?, parentId? }` | Tạo danh mục mới (hỗ trợ phân cấp cha/con) |
| `GET` | `/categories` | Query: `type`, `parentId` | Danh sách danh mục (gồm danh mục hệ thống + cá nhân) |
| `GET` | `/categories/:id` | Param: UUID danh mục | Xem chi tiết danh mục |
| `PATCH`| `/categories/:id` | `{ name?, icon?, color?, parentId? }` | Cập nhật danh mục |
| `DELETE`| `/categories/:id` | Param: UUID danh mục | Xóa danh mục |

---

### 2.8. Ngân Sách Chi Tiêu (`/api/v1/budgets`)
Lập hạn mức chi tiêu theo danh mục và chu kỳ thời gian.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/budgets` | `{ categoryId, amount, startDate, endDate, period?, alertThreshold?, isAlertEnabled?, description? }` | Tạo kế hoạch ngân sách |
| `GET` | `/budgets` | Query phân trang, period, active | Danh sách ngân sách |
| `GET` | `/budgets/summary` | Query: thời gian | Thống kê tổng quan tình hình ngân sách (tiêu bao nhiêu / hạn mức) |
| `GET` | `/budgets/:id` | Param: UUID ngân sách | Chi tiết ngân sách cụ thể |
| `PATCH`| `/budgets/:id` | Cập nhật hạn mức, ngày, cảnh báo | Sửa ngân sách |
| `DELETE`| `/budgets/:id` | Param: UUID ngân sách | Xóa ngân sách |

---

### 2.9. Giao Dịch Định Kỳ (`/api/v1/recurring-transactions`)
Tự động hóa các khoản chi/thu lặp lại (tiền thuê nhà, lương, dịch vụ hàng tháng).

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/recurring-transactions` | `{ name, walletId, categoryId?, amount, type, frequency, interval?, startDate, endDate?, description? }` | Tạo lịch giao dịch định kỳ |
| `GET` | `/recurring-transactions` | Query phân trang, trạng thái | Danh sách lịch định kỳ |
| `GET` | `/recurring-transactions/:id` | Param: UUID lịch | Chi tiết lịch định kỳ |
| `PATCH`| `/recurring-transactions/:id` | Sửa số tiền, tần suất, ví | Cập nhật lịch |
| `POST` | `/recurring-transactions/:id/mark-run` | Không | Kích hoạt chạy ngay một chu kỳ giao dịch thủ công |
| `PATCH`| `/recurring-transactions/:id/pause` | Không | Tạm dừng lịch định kỳ |
| `PATCH`| `/recurring-transactions/:id/resume`| Không | Kích hoạt tiếp tục chạy |
| `DELETE`| `/recurring-transactions/:id` | Param: UUID | Xóa lịch định kỳ |

---

### 2.10. Mục Tiêu Tiết Kiệm (`/api/v1/goals`)
Quản lý mục tiêu tài chính, đóng góp tiền và theo dõi tiến độ hoàn thành.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/goals` | `{ name, targetAmount, startDate, targetDate, priority?, walletId?, description? }` | Tạo mục tiêu tiết kiệm |
| `GET` | `/goals` | Query: status, priority, phân trang | Danh sách mục tiêu |
| `GET` | `/goals/summary` | Không | Thống kê tổng số mục tiêu, tiền đã tiết kiệm, tiến độ |
| `GET` | `/goals/:id` | Param: UUID mục tiêu | Chi tiết mục tiêu |
| `PATCH`| `/goals/:id` | Sửa mục tiêu | Cập nhật mục tiêu |
| `DELETE`| `/goals/:id` | Param: UUID mục tiêu | Xóa mục tiêu |
| `POST` | `/goals/:id/deposit` | `{ amount, walletId, note? }` | Nạp tiền vào mục tiêu (trừ số dư ví tương ứng) |
| `POST` | `/goals/:id/withdraw` | `{ amount, walletId, note? }` | Rút tiền từ mục tiêu về ví |
| `PATCH`| `/goals/:id/pause` | Không | Tạm dừng mục tiêu |
| `PATCH`| `/goals/:id/resume` | Không | Tiếp tục mục tiêu |
| `POST` | `/goals/:id/contributions` | `{ amount, walletId?, contributionDate?, note? }` | Ghi nhận khoản đóng góp |
| `GET` | `/goals/:id/contributions` | Query phân trang | Danh sách các khoản đóng góp của mục tiêu |
| `GET` | `/goals/:id/contributions/stats` | Không | Thống kê lịch sử đóng góp |
| `GET` | `/goals/:id/contributions/:contributionId` | Param IDs | Chi tiết một khoản đóng góp |
| `PATCH`| `/goals/:id/contributions/:contributionId` | Sửa khoản đóng góp | Cập nhật khoản đóng góp |
| `DELETE`| `/goals/:id/contributions/:contributionId` | Param IDs | Xóa khoản đóng góp |
| `DELETE`| `/goals/:id/contributions` | Param: UUID goal | Xóa toàn bộ lịch sử đóng góp của mục tiêu |

---

### 2.11. Quản Lý Khoản Nợ & Vay (`/api/v1/debts` & `/api/v1/debt-payments`)
Theo dõi các khoản mình vay (`LOAN`) hoặc cho vay (`DEBT`) và lịch trình trả nợ.

#### Khoản Nợ (`/debts`)
| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/debts` | `{ name, type, totalAmount, startDate, dueDate, interestRate?, monthlyPayment?, contactName?, borrower?, walletId? }` | Tạo khoản nợ/vay |
| `GET` | `/debts` | Query phân trang, status, type | Danh sách nợ/vay |
| `GET` | `/debts/summary` | Không | Tổng hợp số nợ phải trả và số nợ cần thu |
| `GET` | `/debts/:id` | Param: UUID nợ | Chi tiết khoản nợ |
| `PATCH`| `/debts/:id` | Sửa thông tin nợ | Cập nhật khoản nợ |
| `DELETE`| `/debts/:id` | Param: UUID nợ | Xóa khoản nợ |

#### Thanh Toán Nợ (`/debt-payments`)
| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/debt-payments` | `{ debtId, amount, paymentDate, method, note? }` | Ghi nhận thanh toán nợ (tự động cập nhật `paidAmount` của debt) |
| `GET` | `/debt-payments` | Query: `debtId`, phân trang | Lịch sử thanh toán của khoản nợ |
| `GET` | `/debt-payments/:id` | Param: UUID thanh toán | Chi tiết đợt thanh toán |
| `PATCH`| `/debt-payments/:id` | Sửa số tiền thanh toán | Cập nhật đợt thanh toán |
| `DELETE`| `/debt-payments/:id` | Param: UUID thanh toán | Xóa đợt thanh toán |

---

### 2.12. Thẻ Giao Dịch (`/api/v1/tags`)
Gán nhãn tùy biến cho các giao dịch để phân tích chi tiết.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/tags` | `{ name, color?, icon? }` | Tạo một thẻ mới |
| `POST` | `/tags/bulk` | `{ names: string[] }` | Tạo nhanh nhiều thẻ cùng lúc |
| `GET` | `/tags` | Query phân trang, search | Danh sách thẻ |
| `GET` | `/tags/autocomplete` | Query: `keyword` | Tìm kiếm nhanh tên thẻ cho dropdown gợi ý |
| `GET` | `/tags/popular` | Query: `limit` | Lấy các thẻ được dùng nhiều nhất |
| `GET` | `/tags/:id` | Param: UUID thẻ | Chi tiết thẻ |
| `PATCH`| `/tags/:id` | `{ name?, color?, icon? }` | Đổi tên/màu thẻ |
| `DELETE`| `/tags/:id` | Param: UUID thẻ | Xóa thẻ |

---

### 2.13. Tùy Chọn Người Dùng (`/api/v1/user-preference`)
Cấu hình ngôn ngữ, tiền tệ mặc định, theme và cài đặt thông báo.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/user-preference` | Tạo mới tùy chọn người dùng | Khởi tạo bảng preferences |
| `GET` | `/user-preference` | Không | Lấy cài đặt tùy chọn của tài khoản |
| `PATCH`| `/user-preference` | `{ language?, currency?, theme?, weekStartsOn?, dateFormat?, timeFormat?, budgetNotification?, ... }` | Cập nhật cấu hình hiển thị & thông báo |
| `DELETE`| `/user-preference/reset` | Không | Đặt lại cấu hình về mặc định hệ thống |

---

### 2.14. Thông Báo (`/api/v1/notifications`)
Hệ thống thông báo cảnh báo ngân sách, đến hạn trả nợ, đạt mục tiêu tiết kiệm.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/notifications` | Tạo thông báo mới (nội bộ/admin) | Tạo notification |
| `GET` | `/notifications` | Query phân trang, `isRead`, `type` | Danh sách thông báo |
| `GET` | `/notifications/unread-count` | Không | Lấy số lượng thông báo chưa đọc |
| `GET` | `/notifications/:id` | Param: UUID | Chi tiết thông tin thông báo |
| `PATCH`| `/notifications/:id/read` | Param: UUID | Đánh dấu 1 thông báo là đã đọc |
| `PATCH`| `/notifications/mark-all-read` | Không | Đánh dấu tất cả thông báo là đã đọc |
| `PATCH`| `/notifications/mark-all-unread` | Không | Đánh dấu tất cả là chưa đọc |
| `DELETE`| `/notifications/:id` | Param: UUID | Xóa một thông báo |
| `DELETE`| `/notifications/clear-read` | Không | Dọn sạch tất cả thông báo đã đọc |

---

### 2.15. Kiểm Tra Sức Khỏe & Giám Sát (Health & Metrics)
Các endpoint này **không có** tiền tố `/api` và không có URI version `/v1`.

| Method | Endpoint | Định dạng trả về | Mô tả |
|---|---|---|---|
| `GET` | `/health` | JSON | Terminus Ping Check kết nối PostgreSQL qua Prisma |
| `GET` | `/metrics` | `text/plain` | Prometheus metrics định dạng chuẩn |
| `GET` | `/metrics/json` | JSON | Prometheus metrics dạng dữ liệu JSON |

---

### 2.16. Email Dịch Vụ (`/api/v1/email`)
Endpoint hỗ trợ gửi email trực tiếp hoặc qua queue và kiểm tra mẫu email.

| Method | Endpoint | Body / Query | Mô tả |
|---|---|---|---|
| `POST` | `/email/send` | `{ to, subject, template, context }` | Gửi email đơn lẻ |
| `POST` | `/email/send-bulk` | `{ emails: [...] }` | Gửi email hàng loạt |
| `GET` | `/email/test/welcome` | Không | Kiểm tra gửi mẫu email chào mừng |
| `GET` | `/email/test/reset` | Không | Kiểm tra gửi mẫu email đặt lại mật khẩu |

---

## 3. Điểm Cần Lưu Ý / TODO Cho API
1. **Thiếu CSRF Token ở Client khi gọi Mutation:** Các endpoint của `wallets`, `transactions`, `budgets`, `goals`, `debts`,... đều được bảo vệ bởi `CsrfGuard`. Phía client cần gọi `GET /api/v1/csrf/token` trước hoặc nhận cookie `XSRF-TOKEN` từ lúc đăng nhập và luôn đính kèm header `x-xsrf-token`.
2. **Swagger và Production:** Swagger tại `/api/docs` bị ẩn khi chạy production (`NODE_ENV=production`).
3. **Mâu thuẫn biến cấu hình Version:** Tài liệu cũ ghi `VERSION_API`, nhưng biến thực tế trong `main.ts` là `API_VERSION` (mặc định `'1'`) và `API_PREFIX` (mặc định `'api'`).
