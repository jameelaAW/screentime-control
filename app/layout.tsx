import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screen Time Control",
  description: "Log screen sessions and keep daily limits in view.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

