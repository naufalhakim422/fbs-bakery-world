import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/language-context";
import { NotificationProvider } from "@/lib/notification-context";
import { GoogleTranslateScript } from "@/components/customer/google-translate";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://fbsbakeryworld.com'),
  title: "FBS Bakery World | Premium Baking Supply Malaysia",
  description: "E-Commerce Catalog, Shopping Cart & WhatsApp Checkout for baking ingredients, semolina flour, Kyoto matcha, Belgian chocolate, New Zealand butter, and baking tools across Malaysia.",
  keywords: ["Baking Supply Malaysia", "Tepung Semolina", "Uji Matcha Powder", "Belgian Chocolate Chips", "Anchor Butter", "Baking Ingredients Shah Alam"],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: "FBS Bakery World | Premium Baking Supply Malaysia",
    description: "E-Commerce Catalog & WhatsApp Checkout for premium baking ingredients across Malaysia.",
    url: "https://fbsbakeryworld.com",
    siteName: "FBS Bakery World",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "FBS Bakery World",
      },
    ],
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FBS Bakery World | Premium Baking Supply Malaysia",
    description: "E-Commerce Catalog & WhatsApp Checkout for premium baking ingredients across Malaysia.",
    images: ["/logo.jpg"],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FBS Bakery World',
    url: 'https://fbsbakeryworld.com',
    logo: 'https://fbsbakeryworld.com/logo.jpg',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+60183942147',
      contactType: 'customer service',
      areaServed: ['MY', 'ID'],
      availableLanguage: ['English', 'Malay', 'Indonesian'],
    },
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FBS Bakery World',
    url: 'https://fbsbakeryworld.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://fbsbakeryworld.com/products?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en" className="overflow-x-hidden max-w-full">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-[#800020] selection:text-[#D4AF37] overflow-x-hidden max-w-full w-full font-satoshi">
        <LanguageProvider>
          <CartProvider>
            <NotificationProvider>
              {children}
              <GoogleTranslateScript />
            </NotificationProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
