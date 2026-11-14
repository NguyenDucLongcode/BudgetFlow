# Tổng quan kiến trúc

## Công nghệ và ranh giới

Frontend chính là ứng dụng Next.js App Router dùng React, TypeScript, React Query, Axios và Zod. Các trang và route handler Next.js nằm trong `src/app`. `public/ui` là ứng dụng Vite/React độc lập được lưu cùng frontend; nó không phải entry point của Next.js.

Trình duyệt gọi các route `/api/...` trên cùng origin. Route handler hoặc service server dùng `serverApiClient` để gọi backend tại `BACKEND_API_URL`. Cách này giữ địa chỉ backend và access token ở server, đồng thời cho phép Next.js chuyển tiếp cookie.

```text
Browser components
  └─ axiosClient / browserApiClient ──> Next.js /api/* (BFF)
                                         ├─ auth/admin/user services
                                         ├─ Redis access-token session
                                         └─ backend API
```

## Các lớp mã nguồn

- `src/app`: route UI, layouts và route handlers của BFF.
- `src/features`: component và logic theo tính năng, hiện có auth và admin/users.
- `src/client`: service và React Query hooks chạy trong trình duyệt.
- `src/server`: service gọi backend, session auth và tích hợp Redis.
- `src/lib/bff`: client API server/browser và chuyển đổi lỗi.
- `src/lib/axios`: Axios instance cho backend server và API same-origin phía browser.
- `src/providers`: React Query và auth providers.
- `src/types`: kiểu dữ liệu API và domain.

## Route UI đang có

| Route | Nội dung hiện tại |
| --- | --- |
| `/` | Tiêu đề BudgetFlow đơn giản |
| `/login` | Form đăng nhập |
| `/register` | Form đăng ký |
| `/admin/dashboard` | Trang khung dashboard admin |
| `/admin/users` | Danh sách người dùng admin |

`proxy.ts` kiểm tra cookie `refresh_token` trên các route giao diện (không khớp các API và tài nguyên tĩnh). Nếu thiếu cookie, proxy chuyển hướng về `/login`, trừ các route được khai báo công khai. Các route tài chính dành cho người dùng chưa được xây dựng trong frontend hiện tại.

## Request và lỗi

Client gọi BFF qua `/api`, gửi cookie cùng request. `serverApiClient` lấy device ID từ header request, truy xuất access token tương ứng trong Redis, sau đó gắn bearer token khi gọi backend. Server API client chuẩn hóa lỗi backend thành `ApiError`; route handlers dùng `handleApiError` để trả lỗi cho browser.

Axios client thử gọi `/api/auth/refresh` một lần khi nhận 401 (chỉ một refresh promise dùng chung cho các request đồng thời), rồi gửi lại request gốc. Nếu refresh lỗi, client gọi logout và xóa auth state phía trình duyệt.
