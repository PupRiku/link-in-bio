import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating dev-tools indicator (the "N" button) in development.
  devIndicators: false,

  // Belt-and-suspenders noindex: enforce it at the header level on every
  // route (in addition to the per-page <meta> tag and robots.txt). This is a
  // private, never-indexed site.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
