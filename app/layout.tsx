import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import Footer from "@/components/Footer";
import { PublicShell } from "@/components/PublicShell";
import { ToastProvider } from "@/components/ToastProvider";
import { FlashToast } from "@/components/FlashToast";

export const metadata: Metadata = {
  title: "TEOTIA & CO. | Chartered Accountants",
  description: "Expert guidance in domestic and international taxation, audit & assurance, and regulatory compliance",
  icons: {
    icon: "/assets/images/favicon.png?v=2",
    shortcut: "/assets/images/favicon.png?v=2",
    apple: "/assets/images/favicon.png?v=2",
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
        <PublicShell footer={<Footer />}>{children}</PublicShell>
        <ToastProvider />
        <Suspense>
          <FlashToast />
        </Suspense>
      </body>
    </html>
  );
}
