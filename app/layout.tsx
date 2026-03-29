import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nikol Coupon | קופונים לשיין, ASOS וTerminalX",
  description: "קופונים עובדים לשיין, ASOS וTerminalX - מתעדכן כל 6 שעות ממקורות בינלאומיים וישראליים",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
