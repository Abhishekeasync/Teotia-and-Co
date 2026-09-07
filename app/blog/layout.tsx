import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "CA Insights Blog — Tax, Compliance & Business Advisory",
  description:
    "Expert insights on taxation, GST, audit, corporate compliance, FEMA, business advisory, and regulatory updates from chartered accountants at TEOTIA & CO.",
  path: "/blog",
  keywords: [
    "tax blog India",
    "GST updates",
    "compliance blog",
    "CA insights",
    "business advisory blog",
    "tax planning tips",
    "corporate law updates",
    "audit best practices",
    "FEMA guidelines",
  ],
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
