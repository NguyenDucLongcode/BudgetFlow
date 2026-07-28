import { z } from "zod";

// Tách riêng password schema để tái sử dụng
const passwordSchema = z
  .string()
  .min(1, "Vui lòng nhập mật khẩu")
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ hoa")
  .regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ thường")
  .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một số")
  .regex(/[^A-Za-z0-9]/, "Mật khẩu phải chứa ít nhất một ký tự đặc biệt")
  .max(100, "Mật khẩu không được vượt quá 100 ký tự");

const emailSchema = z
  .email({ message: "Email không hợp lệ" })
  .min(1, { message: "Email là bắt buộc" })
  .max(100, { message: "Email không được vượt quá 100 ký tự" })
  .trim();

// Tạo schema cho login
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().default(false),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;
