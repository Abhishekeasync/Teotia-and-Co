import { Metadata } from "next";

interface PageMetadataConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}

/**
 * Generate complete metadata for a page with proper canonical URLs,
 * Open Graph tags, Twitter Cards, and keywords
 */
export function generatePageMetadata(config: PageMetadataConfig): Metadata {
  const baseUrl = "https://www.teotiaco.com";
  const canonicalUrl = `${baseUrl}${config.path}`;
  const defaultImage = `${baseUrl}/assets/images/Logo.png`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonicalUrl,
      siteName: "TEOTIA & CO.",
      title: config.title,
      description: config.description,
      images: [
        {
          url: config.image || defaultImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [config.image || defaultImage],
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
}
