# Xác thực và phiên đăng nhập

## Đăng nhập

1. Form đăng nhập kiểm tra dữ liệu bằng schema Zod và gọi auth hook phía client.
2. Browser gửi `POST /api/auth/login` tới Next.js. Axios client tạo hoặc tái sử dụng `x-device-id` trong `localStorage` và gửi header này.
3. Route handler gọi backend qua auth service. Khi đăng nhập thành công, service lưu access token trong Redis theo device ID, với user ID, role và TTL.
4. Cookie do backend trả về được BFF chuyển tiếp về browser. Client điều hướng ADMIN tới `/admin/dashboard`; các role khác hiện được điều hướng tới `/dashboard`.

Lưu ý: `/dashboard` chưa có trang trong mã nguồn hiện tại.

## Refresh và gọi API được bảo vệ

Browser gửi cookie tới BFF. Server API client đọc `x-device-id`, lấy access token tương ứng từ Redis và gắn `Authorization: Bearer ...` khi gọi backend. Khi backend báo 401, Axios client gọi `POST /api/auth/refresh`; BFF gọi backend refresh token, lưu access token mới theo device ID và chuyển tiếp cookie mới. Sau refresh thành công, request ban đầu được gửi lại.

## Đăng xuất

- `POST /api/auth/logout` yêu cầu `x-device-id`, gọi backend và xóa access token session của thiết bị đó khỏi Redis.
- `POST /api/auth/logout-all` gọi backend và xóa session Redis của thiết bị hiện tại nếu có device ID.

## Lưu ý vận hành

- Cookie refresh token là cookie do backend quản lý và được BFF chuyển tiếp; frontend không lưu refresh token trong localStorage.
- Access token được giữ ở Redis phía server, không gửi về component trình duyệt như một bearer token.
- Device ID là mã định danh thiết bị lưu trong localStorage; xóa localStorage sẽ tạo ID mới ở request kế tiếp.
- Redis phải truy cập được để khôi phục access token từ request BFF. Cấu hình kết nối xem [BFF API và cấu hình môi trường](api-and-configuration.md).
- Proxy hiện kiểm tra sự tồn tại của cookie refresh token để quyết định redirect; kiểm tra này không thay cho xác minh quyền ở backend. API admin vẫn cần backend bảo vệ.
