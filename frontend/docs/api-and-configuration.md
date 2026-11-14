# BFF API và cấu hình môi trường

## Route handlers hiện có

| Method | Frontend route | Backend path được gọi |
| --- | --- | --- |
| POST | `/api/auth/login` | `/auth/login` |
| POST | `/api/auth/register` | `/auth/register` |
| POST | `/api/auth/refresh` | `/auth/refresh-token` |
| POST | `/api/auth/logout` | `/auth/logout` |
| POST | `/api/auth/logout-all` | `/auth/logout-all` |
| GET | `/api/admin/users` | `/admin/users` |
| GET | `/api/users/me` | `/users/me` |

Các backend path được nối vào base URL. Vì vậy với cấu hình mặc định `BACKEND_API_URL=http://localhost:8080/api/v1`, request đăng nhập sẽ tới `http://localhost:8080/api/v1/auth/login`.

`GET /api/admin/users` chuyển tiếp query parameters tới service backend. Các route auth chuyển tiếp cookie `Set-Cookie` do backend trả về ở những luồng login, refresh và logout.

## Biến môi trường

Đặt các biến server-side trong `frontend/.env.local` khi phát triển. Không dùng tiền tố `NEXT_PUBLIC_` cho cấu hình backend hoặc Redis.

| Biến | Mặc định trong mã | Mục đích |
| --- | --- | --- |
| `BACKEND_API_URL` | `http://localhost:8080/api/v1` | Base URL backend BudgetFlow |
| `REDIS_HOST` | `localhost` | Host Redis lưu access token session |
| `REDIS_PORT` | `6379` | Port Redis |
| `REDIS_PASSWORD` | không đặt | Mật khẩu Redis, nếu cần |
| `REDIS_DB` | `0` | Redis database index |
| `REDIS_PREFIX` | `budgetflow:` | Prefix key Redis |

Khi frontend chạy trong Docker Compose cùng backend và Redis, `localhost` thường trỏ vào container frontend; hãy đặt host theo tên service trên Docker network. Base URL backend cũng cần dùng hostname và port nội bộ phù hợp.

## Xử lý lỗi

Các service server dùng `ApiError` cho lỗi có payload API, còn route handler chuyển lỗi qua `handleApiError`. Phía browser, Axios client trả lỗi cho React Query hook; riêng lỗi 401 có thể kích hoạt refresh token như mô tả trong [Xác thực và phiên đăng nhập](authentication.md).
