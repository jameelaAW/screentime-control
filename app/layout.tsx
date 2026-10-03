import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { TzCookie } from "@/components/TzCookie";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screen Time Control",
  description: "Track children's screen time against daily limits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <ToastProvider>
          <TzCookie />
          <Sidebar />
          <main className="p-4 sm:p-6 md:ml-60 md:p-8">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
