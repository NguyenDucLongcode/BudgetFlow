import { Request, Response, NextFunction } from 'express';

// Middleware dùng để ghi log cho từng HTTP request gửi đến server
export function logger(req: Request, res: Response, next: NextFunction) {
  // Lấy phương thức HTTP (GET, POST, PUT, DELETE, ...)
  const { method } = req;

  // Lấy đường dẫn gốc được gọi (VD: /api/users)
  // Sử dụng encodeURIComponent để tránh log injection
  const originalUrl = encodeURIComponent(req.originalUrl);

  // Ghi lại thời điểm bắt đầu request
  const start = Date.now();

  // Lấy địa chỉ IP của client gửi request
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  // Khi response kết thúc (được gửi trả về cho client), thì sự kiện 'finish' sẽ được gọi
  res.on('finish', () => {
    // Tính thời gian xử lý (thời gian thực thi API)
    const ms = Date.now() - start;

    // Mã trạng thái trả về từ server (200, 404, 500, ...)
    const status = res.statusCode;

    // Màu sắc để làm nổi bật log dựa vào status code
    const color =
      status >= 500
        ? '\x1b[31m' // Đỏ (500+): lỗi server
        : status >= 400
          ? '\x1b[33m' // Vàng (400-499): lỗi client
          : status >= 300
            ? '\x1b[36m' // Cyan (300-399): redirect
            : status >= 200
              ? '\x1b[32m' // Xanh lá (200-299): thành công
              : '\x1b[0m'; // Mặc định

    // Ngày giờ hiện tại định dạng ISO (ví dụ: 2025-08-06T16:30:12.345Z)
    const timestamp = new Date().toISOString();

    // In log ra console với màu sắc
    console.log(
      `[${timestamp}] - ${method} ${originalUrl} - ${color}${status}\x1b[0m - ${ms}ms - IP: ${ip}`,
    );
  });

  // Gọi next() để tiếp tục xử lý request bởi middleware hoặc controller tiếp theo

  next();
}
