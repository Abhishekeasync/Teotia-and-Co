import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact TEOTIA & CO. — Book a Free Consultation in Noida",
  description:
    "Get in touch with TEOTIA & CO. for expert chartered accountancy services. Book a free consultation, visit our Noida office, or reach us at +91 8287858780. Serving Delhi NCR and beyond.",
  path: "/contact",
  keywords: [
    "contact CA Noida",
    "book CA consultation",
    "TEOTIA & CO contact",
    "CA firm Noida address",
    "chartered accountant phone number",
    "business advisory consultation",
    "tax consultant Noida",
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
