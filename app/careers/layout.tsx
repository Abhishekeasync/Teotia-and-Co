import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Careers at TEOTIA & CO. — Join Our CA Team in Noida",
  description:
    "Explore career opportunities at TEOTIA & CO., a leading chartered accountancy firm in Noida. Join our team of taxation, audit, and business advisory professionals.",
  path: "/careers",
  keywords: [
    "CA jobs Noida",
    "chartered accountant careers",
    "audit jobs Delhi NCR",
    "tax consultant jobs",
    "accounting jobs Noida",
    "TEOTIA & CO careers",
    "finance jobs India",
  ],
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
