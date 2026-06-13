import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "B2B Market Grid - B2B Wholesale Marketplace | Secure Escrow Trading",
    template: "%s | B2B Market Grid",
  },
  description:
    "B2B Market Grid is the premier B2B wholesale marketplace connecting suppliers and retailers. Browse products, post RFQs, and trade securely with escrow payments. Low 3% commission.",
  keywords: [
    "wholesale marketplace",
    "B2B trading platform",
    "bulk supplier",
    "wholesale distributor",
    "RFQ marketplace",
    "escrow payment",
    "wholesale products",
    "bulk order",
    "supplier directory",
    "retailer wholesale",
    "trade wholesale",
    "B2B escrow",
    "wholesale electronics",
    "bulk clothing supplier",
    "food wholesale distributor",
  ],
  authors: [{ name: "B2B Market Grid" }],
  creator: "B2B Market Grid",
  publisher: "B2B Market Grid",
  metadataBase: new URL("https://b2bmarketgrid.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  openGraph: {
    title: "B2B Market Grid - B2B Wholesale Marketplace",
    description:
      "Connect with verified wholesalers and retailers. Trade securely with escrow payments. Post RFQs and get competitive quotes.",
    type: "website",
    locale: "en_US",
    siteName: "B2B Market Grid",
    images: [
      {
        url: "/hero-bg.png",
        width: 1344,
        height: 768,
        alt: "B2B Market Grid - B2B Wholesale Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "B2B Market Grid - B2B Wholesale Marketplace",
    description:
      "Connect with verified wholesalers and retailers. Trade securely with escrow payments.",
    images: ["/hero-bg.png"],
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
  category: "marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Marketplace",
    name: "B2B Market Grid",
    description:
      "B2B wholesale marketplace connecting wholesalers and retailers with secure escrow payments",
    url: "https://b2bmarketgrid.com",
    logo: "https://b2bmarketgrid.com/logo.png",
    image: "https://b2bmarketgrid.com/hero-bg.png",
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Escrow, Credit Card, Bank Transfer",
    knowsAbout: [
      "Wholesale Trading",
      "B2B Marketplace",
      "Escrow Payments",
      "RFQ System",
      "Bulk Orders",
    ],
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["English"],
    },
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="theme-color" content="#0a0a1a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
