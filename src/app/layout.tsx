import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cemzo.com"),
  applicationName: "Cemzo",
  title: {
    default: "Cemzo — Coming Soon | The Future Arrives 2026",
    template: "%s | Cemzo",
  },
  description:
    "Join the waitlist for Cemzo, an innovative app redefining the digital experience. Coming 2026 to Android & iOS.",
  keywords: [
    "cemzo",
    "coming soon app",
    "future app 2026",
    "waitlist",
    "new app 2026",
    "tech innovation app",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Cemzo" }],
  creator: "Cemzo",
  publisher: "Cemzo",
  category: "Technology",
  openGraph: {
    title: "Cemzo — Coming Soon | The Future Arrives 2026",
    description:
      "Join the waitlist for Cemzo, an innovative app redefining the digital experience. Coming 2026 to Android & iOS.",
    url: "https://cemzo.com",
    siteName: "Cemzo",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/cemzo-poster.svg",
        width: 1440,
        height: 900,
        alt: "Cemzo Coming Soon Poster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cemzo — Coming Soon | The Future Arrives 2026",
    description:
      "Join the waitlist for Cemzo, an innovative app redefining the digital experience. Coming 2026 to Android & iOS.",
    creator: "@cemzo",
    site: "@cemzo",
    images: [
      {
        url: "/cemzo-poster.svg",
        width: 1440,
        height: 900,
        alt: "Cemzo Coming Soon Poster",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
