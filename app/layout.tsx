import type { Metadata, Viewport } from "next";
import { TzCookie } from "@/components/TzCookie";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screen Time Control",
  description: "Log screen sessions and keep daily limits in view.",
  applicationName: "Screen Time Control",
  appleWebApp: { capable: true, title: "Screen Time", statusBarStyle: "default" },
  icons: { icon: "/pwa-icon/192", apple: "/pwa-icon/180" },
};

export const viewport: Viewport = {
  themeColor: "#267265",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased"><TzCookie />{children}</body>
    </html>
  );
}

