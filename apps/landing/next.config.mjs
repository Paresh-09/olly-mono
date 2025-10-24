import nextMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypePrism from "rehype-prism-plus";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // ONLY SAFE ADDITIONS - these are just performance hints
    formats: ['image/webp', 'image/avif'], // Enable modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Default sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Default sizes

    // Your existing remote patterns (keep these unchanged)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "videosilvids.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "ph-avatars.imgix.net",
      },
      {
        protocol: "https",
        hostname: "api.producthunt.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "appsumo2ppnuxt.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "appsumo2-cdn.appsumo.com",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  experimental: {
    mdxRs: true,
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "chrome-extension://pacnbcamkdmmkhkfdjpoegffidfiecde",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
      // Added configuration for .well-known directory
      {
        source: "/.well-known/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/json"
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600"
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/openai/free-comments-generate-daily/",
        destination:
          "https://www.olly.social/api/openai/free-comments-generate-daily/",
      },
    ];
  },
};

// Apply bundle analyzer and MDX configuration and export
export default withBundleAnalyzer(withMDX(nextConfig));