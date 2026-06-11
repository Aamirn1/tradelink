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
    default: "Bulk Stock Trade - B2B Wholesale Marketplace | Secure Escrow Trading",
    template: "%s | Bulk Stock Trade",
  },
  description:
    "Bulk Stock Trade is the premier B2B wholesale marketplace connecting suppliers and retailers. Browse products, post RFQs, and trade securely with escrow payments. Low 3% commission.",
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
  authors: [{ name: "Bulk Stock Trade" }],
  creator: "Bulk Stock Trade",
  publisher: "Bulk Stock Trade",
  metadataBase: new URL("https://bulkstocktrade.com"),
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
    title: "Bulk Stock Trade - B2B Wholesale Marketplace",
    description:
      "Connect with verified wholesalers and retailers. Trade securely with escrow payments. Post RFQs and get competitive quotes.",
    type: "website",
    locale: "en_US",
    siteName: "Bulk Stock Trade",
    images: [
      {
        url: "/hero-bg.png",
        width: 1344,
        height: 768,
        alt: "Bulk Stock Trade - B2B Wholesale Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bulk Stock Trade - B2B Wholesale Marketplace",
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
    name: "Bulk Stock Trade",
    description:
      "B2B wholesale marketplace connecting wholesalers and retailers with secure escrow payments",
    url: "https://bulkstocktrade.com",
    logo: "https://bulkstocktrade.com/logo.png",
    image: "https://bulkstocktrade.com/hero-bg.png",
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
