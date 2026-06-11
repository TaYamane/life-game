// v2 - profile panel + age display
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DotGothic16 } from "next/font/google";

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIXEL LIFE (仮)",
  description: "スマホ専用！友達と通話しながら遊ぶボードゲーム",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`min-h-screen ${dotGothic.className}`} style={{ backgroundColor: "var(--color-bg)" }}>
        {children}
      </body>
    </html>
  );
}
