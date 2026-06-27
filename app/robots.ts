import type { MetadataRoute } from "next";

// Disallow all crawling — this is a private, never-indexed site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
