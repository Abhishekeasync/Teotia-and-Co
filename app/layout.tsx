import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PublicShell } from "@/components/PublicShell";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "TEOTIA & CO. | Chartered Accountants",
  description: "Expert guidance in domestic and international taxation, audit & assurance, and regulatory compliance",
  icons: {
    icon: "/assets/images/www.wix.com/favicon-3fd805aa90.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PublicShell>{children}</PublicShell>
        <ToastProvider />
      </body>
    </html>
  );
}
