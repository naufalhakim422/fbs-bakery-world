import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/language-context";
import { GoogleTranslateScript } from "@/components/customer/google-translate";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FBS Bakery World | Premium Baking Supply Malaysia",
  description: "E-Commerce Catalog, Shopping Cart & WhatsApp Checkout for baking ingredients, semolina flour, Kyoto matcha, Belgian chocolate, New Zealand butter, and baking tools across Malaysia.",
  keywords: ["Baking Supply Malaysia", "Tepung Semolina", "Uji Matcha Powder", "Belgian Chocolate Chips", "Anchor Butter", "Baking Ingredients Shah Alam"],
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden max-w-full">
      <body className="antialiased selection:bg-[#800020] selection:text-[#D4AF37] overflow-x-hidden max-w-full w-full">
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
