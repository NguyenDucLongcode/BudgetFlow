import type { Metadata } from "next";
import "./globals.css";
import Providers from "../providers";

export const metadata: Metadata = {
  title: "BudgetFlow - Quản Lý Tài Chính Cá Nhân",
  description: "Nền tảng quản lý tài chính thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
