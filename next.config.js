/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' for dynamic Next.js with API integration
  
  // Keep jsdom external so isomorphic-dompurify works on Vercel serverless.
  serverExternalPackages: ['jsdom', 'isomorphic-dompurify'],

  images: {
    // Allow Next.js Image optimization
    unoptimized: false,
    // Add S3 bucket domains for remote images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'teotia-and-co-blog.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'teotia-and-co.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  // Rewrite /api/* to backend server in development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://127.0.0.1:5000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
