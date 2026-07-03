import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "活来了后台",
  description: "活来了劳务招聘后台、API 与小程序服务",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
