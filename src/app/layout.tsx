// v2 - profile panel + age display
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DotGothic16 } from "next/font/google";

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://pixel-life.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: "PIXEL LIFE",
  description: "人生を歩み、選択し、幸せ・資産・名声を競う人生シミュレーションゲーム",

  openGraph: {
    title: "PIXEL LIFE",
    description: "人生を歩み、選択し、幸せ・資産・名声を競う人生シミュレーションゲーム",
    url: BASE_URL,
    siteName: "PIXEL LIFE",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PIXEL LIFE - 人生を歩み、選択し、幸せ・資産・名声を競え！",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PIXEL LIFE",
    description: "人生を歩み、選択し、幸せ・資産・名声を競う人生シミュレーションゲーム",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
