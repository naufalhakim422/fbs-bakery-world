import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  title: "FBS Bakery World | Premium Baking Supply Malaysia",
  description: "E-Commerce Catalog, Shopping Cart & WhatsApp Checkout for baking ingredients, semolina flour, Kyoto matcha, Belgian chocolate, New Zealand butter, and baking tools across Malaysia.",
  keywords: ["Baking Supply Malaysia", "Tepung Semolina", "Uji Matcha Powder", "Belgian Chocolate Chips", "Anchor Butter", "Baking Ingredients Shah Alam"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#800020] selection:text-[#D4AF37]">
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
