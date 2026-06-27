import type { Metadata, Viewport } from "next";
import { Anton, Oswald, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const oswald = Oswald({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const DESCRIPTION = "Riku — links, socials, and where to find me out.";

export const metadata: Metadata = {
  metadataBase: new URL("https://riku.gay"),
  title: {
    default: "RIKU",
    template: "%s · RIKU",
  },
  description: DESCRIPTION,
  // Preview tags and noindex coexist — they govern different things. Keep the
  // site explicitly noindex/nofollow.
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: "website",
    url: "https://riku.gay",
    siteName: "RIKU",
    title: "RIKU",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "RIKU",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${oswald.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
