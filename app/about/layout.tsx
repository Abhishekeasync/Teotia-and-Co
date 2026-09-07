import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "About TEOTIA & CO. — Trusted CA Firm in Noida, Delhi NCR",
  description:
    "Learn about TEOTIA & CO., a premier chartered accountancy firm in Noida providing expert taxation, audit, compliance, and business advisory services since our founding.",
  path: "/about",
  keywords: [
    "about TEOTIA & CO",
    "CA firm Noida",
    "chartered accountants Delhi NCR",
    "tax advisory team",
    "audit professionals Noida",
    "business consultants India",
    "professional CA services",
  ],
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
