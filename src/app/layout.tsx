import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/language-context";
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
  return (
    <html lang="en" className="overflow-x-hidden max-w-full">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-[#800020] selection:text-[#D4AF37] overflow-x-hidden max-w-full w-full font-satoshi">
        <LanguageProvider>
          <CartProvider>
            {children}
            <GoogleTranslateScript />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
