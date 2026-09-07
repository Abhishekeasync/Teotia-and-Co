import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "CA Services in Noida — Taxation, Compliance & Corporate Advisory",
  description:
    "Comprehensive CA services including GST, income tax, audit, corporate compliance, FDI/FEMA advisory, M&A support, company incorporation, and business restructuring in Noida and Delhi NCR.",
  path: "/services",
  keywords: [
    "CA services Noida",
    "taxation services",
    "GST compliance",
    "income tax advisory",
    "audit services",
    "corporate compliance",
    "FDI FEMA advisory",
    "company incorporation",
    "M&A advisory",
    "business restructuring",
    "IPR protection",
    "startup advisory",
  ],
});

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
