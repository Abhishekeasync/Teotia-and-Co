/**
 * SchemaOrg Component
 * Renders JSON-LD structured data for SEO
 */

interface SchemaOrgProps {
  schema: object;
}

export function SchemaOrg({ schema }: SchemaOrgProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization Schema for TEOTIA & CO.
export const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AccountingService",
      "@id": "https://www.teotiaco.com/#organization",
      "name": "Teotia & Co.",
      "legalName": "TEOTIA & CO.",
      "url": "https://www.teotiaco.com",
      "logo": "https://www.teotiaco.com/assets/images/Logo.png",
      "image": "https://www.teotiaco.com/assets/images/Logo.png",
      "telephone": "+91-8287858780",
      "email": "info@teotiaco.com",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "F2, Block-F, Sector-8",
        "addressLocality": "Noida",
        "addressRegion": "Uttar Pradesh",
        "postalCode": "201301",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "28.5945",
        "longitude": "77.3190"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Noida"
        },
        {
          "@type": "City",
          "name": "Greater Noida"
        },
        {
          "@type": "State",
          "name": "Delhi NCR"
        },
        {
          "@type": "Country",
          "name": "India"
        }
      ],
      "openingHours": "Mo-Fr 09:00-18:00",
      "founder": [
        {
          "@type": "Person",
          "@id": "https://www.teotiaco.com/team/shubham-teotia",
          "name": "Shubham Teotia",
          "jobTitle": "Chartered Accountant"
        }
      ],
      "employee": [
        {
          "@type": "Person",
          "@id": "https://www.teotiaco.com/team/shubham-teotia",
          "name": "Shubham Teotia",
          "jobTitle": "Chartered Accountant"
        },
        {
          "@type": "Person",
          "@id": "https://www.teotiaco.com/team/rahul-chaudhary",
          "name": "Rahul Chaudhary",
          "jobTitle": "Chartered Accountant"
        },
        {
          "@type": "Person",
          "@id": "https://www.teotiaco.com/team/shefali-teotia",
          "name": "Shefali Teotia",
          "jobTitle": "Partner"
        },
        {
          "@type": "Person",
          "@id": "https://www.teotiaco.com/team/kunal-teotia",
          "name": "Kunal Teotia",
          "jobTitle": "Company Secretary"
        },
        {
          "@type": "Person",
          "@id": "https://www.teotiaco.com/team/shaurya-nijhawan",
          "name": "Shaurya Nijhawan",
          "jobTitle": "Chartered Accountant"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Professional CA Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Company Incorporation Services",
              "url": "https://www.teotiaco.com/services/company-incorporation",
              "description": "Business setup and company registration services"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Corporate Secretarial Compliance",
              "url": "https://www.teotiaco.com/services/corporate-secretarial",
              "description": "Corporate law compliance and governance"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "FDI & FEMA Advisory",
              "url": "https://www.teotiaco.com/services/fdi-fema-advisory",
              "description": "Foreign investment regulations and compliance"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Regulatory Approvals",
              "url": "https://www.teotiaco.com/services/regulatory-approvals",
              "description": "Government licenses and regulatory clearances"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "M&A Advisory",
              "url": "https://www.teotiaco.com/services/ma-transaction-advisory",
              "description": "Mergers, acquisitions, and transaction advisory"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Contracts & Commercial Agreements",
              "url": "https://www.teotiaco.com/services/contracts-agreements",
              "description": "Legal contracts and commercial agreements"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Startup & MSME Advisory",
              "url": "https://www.teotiaco.com/services/startup-msme-advisory",
              "description": "Business advisory for startups and MSMEs"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "IPR Protection",
              "url": "https://www.teotiaco.com/services/ipr-protection",
              "description": "Intellectual property rights protection"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Taxation & Accounting",
              "url": "https://www.teotiaco.com/services/taxation-accounting",
              "description": "Tax planning, GST, and accounting services"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Corporate Restructuring",
              "url": "https://www.teotiaco.com/services/corporate-restructuring",
              "description": "Corporate restructuring and due diligence"
            }
          }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.teotiaco.com/#website",
      "url": "https://www.teotiaco.com",
      "name": "TEOTIA & CO.",
      "description": "Chartered Accountants providing expert services in taxation, audit, corporate finance, and regulatory compliance",
      "publisher": {
        "@id": "https://www.teotiaco.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.teotiaco.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};
