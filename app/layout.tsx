import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import Footer from "@/components/Footer";
import { PublicShell } from "@/components/PublicShell";
import { ToastProvider } from "@/components/ToastProvider";
import { FlashToast } from "@/components/FlashToast";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.teotiaco.com"),
  title: {
    default: "Chartered Accountants in Noida | TEOTIA & CO. — Tax, Audit & Advisory",
    template: "%s | TEOTIA & CO.",
  },
  description:
    "Expert chartered accountants in Noida offering taxation, audit & assurance, corporate finance, regulatory compliance, and business advisory services across Delhi NCR.",
  keywords: [
    "chartered accountants Noida",
    "CA firm Noida",
    "tax consultants Noida",
    "audit services Noida",
    "GST compliance Noida",
    "business advisory Delhi NCR",
    "corporate finance advisory",
    "FEMA consultants India",
  ],
  icons: {
    icon: "/assets/images/favicon.png?v=2",
    shortcut: "/assets/images/favicon.png?v=2",
    apple: "/assets/images/favicon.png?v=2",
  },
  alternates: {
    canonical: "https://www.teotiaco.com",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.teotiaco.com",
    siteName: "TEOTIA & CO.",
    title: "Chartered Accountants in Noida | TEOTIA & CO. — Tax, Audit & Advisory",
    description:
      "Expert chartered accountants in Noida offering taxation, audit & assurance, corporate finance, regulatory compliance, and business advisory services across Delhi NCR.",
    images: [
      {
        url: "/assets/images/Logo.png",
        width: 1200,
        height: 630,
        alt: "TEOTIA & CO. - Chartered Accountants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chartered Accountants in Noida | TEOTIA & CO. — Tax, Audit & Advisory",
    description:
      "Expert chartered accountants in Noida offering taxation, audit & assurance, corporate finance, regulatory compliance, and business advisory services across Delhi NCR.",
    images: ["/assets/images/Logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
