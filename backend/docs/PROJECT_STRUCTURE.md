# Cấu trúc dự án Backend BudgetFlow

Tài liệu này giải thích cách tổ chức mã nguồn backend, trách nhiệm của từng thư mục và luồng xử lý request. Các đường dẫn được tính từ thư mục `backend/`.

## 1. Tổng quan

Backend được xây dựng bằng NestJS theo mô hình module. `AppModule` kết nối ba nhóm thành phần chính:

- **Core**: cấu hình ứng dụng, bảo mật và các thành phần xử lý request dùng chung.
- **Infrastructure**: kết nối các dịch vụ nền như PostgreSQL/Prisma, Redis, queue và email.
- **Modules**: các chức năng nghiệp vụ của BudgetFlow.

Luồng tổng quát:

```text
HTTP request
  → main.ts (prefix, version, CORS, middleware, validation, Swagger)
  → Core (guard, bảo mật, interceptor, exception filter)
  → controller của module nghiệp vụ
  → service xử lý nghiệp vụ
  → repository / PrismaService
  → PostgreSQL
```

Một số luồng có thể gọi thêm Redis, queue hoặc dịch vụ email.

## 2. Cây thư mục

```text
backend/
├── docs/                         # Tài liệu API và tài liệu kiến trúc
├── prisma/
│   ├── migrations/               # Migration SQL theo thứ tự thời gian
│   ├── seeds/                    # Các nhóm dữ liệu mẫu
│   ├── schema.prisma             # Mô hình dữ liệu và quan hệ
│   ├── seed.ts                   # Điểm chạy seed
│   └── prisma.config.ts          # Cấu hình Prisma nằm ở backend/prisma.config.ts
├── src/
│   ├── common/                   # Thành phần dùng chung
│   ├── core/                     # Cấu hình và xử lý xuyên suốt ứng dụng
│   ├── infrastructure/           # Tích hợp hạ tầng bên ngoài
│   ├── modules/                  # Các module nghiệp vụ
│   ├── monitoring/               # Health check và metrics
│   ├── app.module.ts             # Module gốc, ghép các nhóm module
│   └── main.ts                   # Khởi động HTTP server
├── .env.example                  # Mẫu một phần biến môi trường
├── package.json                 # Scripts và dependencies
└── README.md                     # Hướng dẫn cài đặt và chạy backend
```

Lưu ý: file cấu hình Prisma ở `prisma.config.ts` tại thư mục gốc `backend/`, không nằm trong `prisma/`.

## 3. Điểm khởi động và ghép module

### `src/main.ts`

Khởi tạo Nest application và thiết lập HTTP server:

- Global prefix mặc định là `/api`.
- URI versioning mặc định là `/v1`.
- CORS, Helmet, cookie parser và validation pipe.
- Swagger được bật khi `NODE_ENV` khác `production`, tại `/api/docs`.
- Đọc `PORT` và `HOST` để lắng nghe kết nối.
- Đăng ký shutdown hooks.

Các endpoint monitoring được loại khỏi global prefix và version: `/health`, `/metrics`, `/metrics/json`.

### `src/app.module.ts`

Module gốc đưa vào `CoreModule`, `InfrastructureModule`, `MonitoringModule` và `BaseModule`.

### `src/modules/base.module.ts`

Tập hợp các module nghiệp vụ đang được đăng ký: auth, user, wallet, category, transaction, budget, recurring transaction, goal, debt, debt payment, user preference, notification và tag.

## 4. `src/common/` — thành phần dùng chung

```text
common/
├── configs/       # Joi env validation, cấu hình validation, Swagger, mailer
├── constants/     # Hằng số dùng chung
├── decorators/    # Decorator như Public, CurrentUser, Audit, Sanitize
├── filters/       # Exception filter toàn cục
├── interceptors/  # Response mapping và audit log
├── interfaces/    # Kiểu dữ liệu dùng chung và mở rộng Express Request
├── middeware/     # Middleware dùng chung (tên thư mục hiện tại viết là middeware)
└── utils/         # Hàm tiện ích, ví dụ Redis key và thời gian
```

Đặt ở đây những thành phần thực sự dùng qua nhiều module. Logic chỉ phục vụ một tính năng nên nằm trong module tính năng tương ứng.

## 5. `src/core/` — cấu hình và cross-cutting concerns

- `config/`: đăng ký cấu hình Nest và kiểm tra biến môi trường.
- `filters/`: đăng ký exception filter.
- `guards/`: tập hợp guard áp dụng ở phạm vi ứng dụng.
- `interceptor/`: đăng ký interceptor toàn cục.
- `security/`: cấu hình bảo mật, gồm CASL authorization/policies, CSRF, Helmet và rate limit.

`CoreModule` ghép các phần trên. Khi thay đổi bảo mật hoặc hành vi áp dụng cho nhiều route, kiểm tra module này và các decorator/guard liên quan trước.

## 6. `src/infrastructure/` — tích hợp hạ tầng

- `prisma/`: `PrismaService`, module Prisma và các repository truy cập dữ liệu.
- `redis/`: khởi tạo và cung cấp Redis client.
- `queue/`: cấu hình BullMQ, health service, xử lý email job và công việc cleanup định kỳ.
- `email/`: controller/service gửi email, DTO, interface và template Handlebars.

`InfrastructureModule` gom các module này để module nghiệp vụ có thể inject các dịch vụ hạ tầng cần thiết. Repository hiện có cho user, wallet, transaction, budget, category, goal, debt, notification, session và các quan hệ liên quan.

## 7. `src/modules/` — chức năng nghiệp vụ

Các module thường tổ chức theo mẫu: `*.module.ts` khai báo phụ thuộc; `*.controller.ts` nhận HTTP request; `*.service.ts` thực hiện use case; `dto/` xác thực dữ liệu vào; thư mục `services/` hoặc `swagger/` chia nhỏ phần triển khai khi cần.

| Thư mục | Trách nhiệm |
| --- | --- |
| `auth/` | Đăng nhập/đăng ký, JWT, refresh/logout, xác minh email, đặt lại mật khẩu, Google OAuth. Có DTO, strategy/guard và tài liệu Swagger riêng. |
| `user/` | Hồ sơ người dùng và thao tác quản trị; tách controller, service và DTO user/admin. |
| `session/` | Quản lý phiên đăng nhập, được dùng hỗ trợ luồng xác thực. |
| `wallet/` | CRUD ví và truy vấn danh sách ví. |
| `category/` | Danh mục thu/chi. |
| `transaction/` | Giao dịch, phân trang, gắn tag và file đính kèm; service con nằm trong `services/`. |
| `budget/` | Ngân sách và truy vấn ngân sách. |
| `recurring-transaction/` | Giao dịch định kỳ. |
| `goal/` | Mục tiêu tiết kiệm và khoản đóng góp cho mục tiêu; service con nằm trong `services/`. |
| `debt/` | Khoản nợ. |
| `debt-payment/` | Các khoản thanh toán nợ. |
| `tag/` | Tag có thể gắn với giao dịch. |
| `user-preference/` | Tùy chọn cá nhân của người dùng. |
| `notification/` | Tạo, truy vấn và cập nhật thông báo. |
| `audit/` | Chức năng hỗ trợ nhật ký hoạt động/audit. |

Tên route và chi tiết request/response cần xem trong controller, DTO và Swagger của module tương ứng; không nên suy ra endpoint chỉ từ tên thư mục.

## 8. `src/monitoring/`

- `health/`: endpoint `/health`, kiểm tra kết nối PostgreSQL qua Prisma.
- `metrics/`: `/metrics` xuất Prometheus text format và `/metrics/json` xuất JSON.
- `monitoring.module.ts`: ghép các module monitoring.

## 9. `prisma/` — dữ liệu và migration

- `schema.prisma`: khai báo model, enum, quan hệ và cấu hình generator/datasource.
- `migrations/`: các thay đổi schema đã được lưu thành migration SQL. Thêm thay đổi dữ liệu nên tạo migration mới, không sửa migration cũ đã áp dụng ở môi trường dùng chung.
- `seeds/`: seed được chia thành từng miền như user, wallet, category, transaction, budget, debt, goal và preference.
- `seed.ts`: điểm chạy seed từ script `npm run seed`.
- `prisma.config.ts`: file ở gốc backend, trỏ đến schema và cấu hình datasource/migration seed.

Để hiểu một bảng, đối chiếu model trong `schema.prisma`, migration tạo/cập nhật model, repository và service sử dụng nó.

## 10. Cách lần theo một tính năng

Ví dụ khi cần tìm luồng tạo ví:

1. Mở `src/modules/wallet/wallet.controller.ts` để xem route và quyền truy cập.
2. Xem DTO trong `src/modules/wallet/dto/` để biết dữ liệu đầu vào.
3. Theo lời gọi sang `wallet.service.ts` để đọc quy tắc nghiệp vụ.
4. Theo service tới repository trong `src/infrastructure/prisma/repositories/`.
5. Đối chiếu model và quan hệ trong `prisma/schema.prisma`.

Khi thêm một module nghiệp vụ mới, thường cần tạo module/controller/service/DTO, đăng ký module trong `BaseModule`, bổ sung repository hoặc schema/migration nếu có dữ liệu mới, rồi cập nhật Swagger nếu cần.

## 11. Cấu hình và tài liệu liên quan

- Cách cài đặt, chạy local, biến môi trường và lệnh npm: [`../README.md`](../README.md).
- Tài liệu API hiện có: [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).
- Mẫu biến môi trường: [`.env.example`](../.env.example). Mẫu này chưa liệt kê toàn bộ biến bắt buộc; đối chiếu `src/common/configs/env.validation.ts`.
- Scripts dự án và dependency: [`../package.json`](../package.json).
