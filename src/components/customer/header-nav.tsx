'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useLanguage, LanguageCode } from '@/lib/language-context';
import { db } from '@/lib/db';
import { CartDrawer } from './cart-drawer';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  User, 
  Menu, 
  X, 
  PackageCheck,
  Globe,
  Check
} from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(db.getStoreSettings());

  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, wishlist } = useCart();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const loadLiveData = () => {
      try {
        setSettings(db.getStoreSettings());
        const session = localStorage.getItem('fbs_customer_session');
        if (session) {
          setCustomerSession(JSON.parse(session));
        } else {
          setCustomerSession(null);
        }
      } catch (e) {}
    };
    loadLiveData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const existingSearch = params.get('search');
      if (existingSearch) {
        setSearchQuery(existingSearch);
      }
    }

    window.addEventListener('storage', loadLiveData);
    window.addEventListener('fbs_db_updated', loadLiveData);
    return () => {
      window.removeEventListener('storage', loadLiveData);
      window.removeEventListener('fbs_db_updated', loadLiveData);
    };
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    } else {
      router.push('/products');
    }
  };

  const navLinks = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.products, href: '/products' },
    { name: t.nav.categories, href: '/categories' },
    { name: t.nav.recipes, href: '/recipes' },
    { name: t.nav.blog, href: '/blog' },
    { name: t.nav.about, href: '/about' },
    { name: t.nav.contact, href: '/contact' },
  ];

  const languagesList: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'MS', label: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'EN', label: 'English', flag: '🇬🇧' },
    { code: 'ZH', label: '中文', flag: '🇨🇳' },
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-[#180A0E] via-[#3A0612] to-[#180A0E] text-[#FFF8F0] sticky top-0 z-40 shadow-xl border-b border-[#D4AF37]/30" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Header Bar */}
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            
            {/* Left: Brand Logo & Typography */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <img 
                src="/logo.jpg" 
                alt="FBS Bakery World Logo" 
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shadow-md border-2 border-[#D4AF37] group-hover:scale-105 transition-transform bg-white"
              />
              <div className="flex flex-col">
                <span className="font-sans font-black text-base sm:text-xl tracking-wider text-[#F7E7CE] uppercase leading-none">
                  FBS BAKERY WORLD
                </span>
                <span className="hidden sm:block text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#F7E7CE]/80 font-medium mt-1">
                  PREMIUM BAKING SUPPLY MALAYSIA
                </span>
              </div>
            </Link>

            {/* Middle: Integrated Search Bar (Desktop/Laptop/Tablet) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm relative mx-4">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-10 py-2 bg-stone-900/80 border border-[#D4AF37]/40 rounded-full text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition-all backdrop-blur-md"
              />
              <button 
                type="submit" 
                className="absolute left-3 top-2.5 text-[#D4AF37] hover:text-white transition-colors"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); router.push('/products'); }}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs font-bold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Right: Actions & User Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              
              {/* Order Tracking Pill Button (Desktop/Laptop/Tablet) */}
              <Link 
                href="/track-order" 
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4A1313] hover:bg-[#3D0F0F] text-[#D4AF37] rounded-full text-xs font-bold border border-[#D4AF37]/40 transition-all hover:scale-105"
              >
                <PackageCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.nav.trackOrder}</span>
              </Link>

              {/* Wishlist Link */}
              <Link 
                href={customerSession ? "/account" : "/account/login"} 
                className="relative p-2 text-stone-200 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-white/5" 
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-[#800020] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:px-3.5 sm:py-2 bg-gradient-to-r from-[#4A1313] to-[#800020] hover:brightness-110 text-[#FFF8F0] rounded-full border border-[#D4AF37]/50 transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
                <span className="hidden sm:inline text-xs font-extrabold tracking-wide">{t.nav.cart}</span>
                <span className="bg-[#D4AF37] text-[#800020] text-[11px] font-black px-1.5 py-0.2 rounded-full shadow">
                  {totalItems}
                </span>
              </button>

              {/* Customer Account or Login Button */}
              <Link 
                href={customerSession ? "/account" : "/account/login"} 
                className="p-2 sm:px-3.5 sm:py-1.5 bg-white/10 hover:bg-white/20 text-[#FFF8F0] hover:text-[#D4AF37] rounded-full border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
                title={customerSession ? `Halo, ${customerSession.name}` : t.nav.signIn}
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span className="hidden sm:inline">
                  {customerSession ? `Halo, ${customerSession.name.split(' ')[0]}` : t.nav.signIn}
                </span>
              </Link>

              {/* Mobile Menu Hamburger Button (PROMINENT HIGH-VISIBILITY BUTTON FOR HP DEVICE) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] active:scale-95 rounded-xl border border-[#D4AF37]/50 shadow-md transition-all flex items-center justify-center gap-1"
                title="Buka Menu Navigasi"
                aria-label="Buka Menu Navigasi"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <>
                    <Menu className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-[10px] font-black uppercase text-[#F7E7CE]">Menu</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Desktop / Laptop / Tablet Navigation Bar (SHOWN ON PC/LAPTOP/IPAD, HIDDEN ON HP) */}
          <div className="hidden md:flex items-center justify-between py-2.5 border-t border-white/10 text-xs font-bold tracking-wide">
            
            {/* Inline Navigation Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-all relative py-1 ${
                      isActive 
                        ? 'text-[#D4AF37] font-extrabold' 
                        : 'text-stone-200 hover:text-[#D4AF37]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-full shadow-glow" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop / Laptop / Tablet Quick Language Switcher Pills */}
            <div className="notranslate flex items-center gap-1 bg-stone-900/90 px-2.5 py-1 rounded-full border border-[#D4AF37]/40 shadow-inner" translate="no">
              <Globe className="w-3.5 h-3.5 text-[#D4AF37] ml-0.5 mr-1" />
              {languagesList.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-all ${
                      isSelected
                        ? 'bg-[#800020] text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {lang.code === 'MS' ? 'MY' : lang.code === 'ID' ? 'ID' : lang.code === 'EN' ? 'EN' : 'CH'}
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* Mobile Expanded Menu Drawer (ONLY SHOWN ON MOBILE HP WHEN HAMBURGER TAPPED) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#181113] border-t border-[#F7E7CE]/20 px-5 pt-5 pb-7 space-y-5 animate-fade-in shadow-2xl">
            
            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-[#D4AF37]/40 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#D4AF37]"
              />
              <button type="submit" className="absolute left-3 top-3 text-[#D4AF37]">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* INTEGRATED LANGUAGE SWITCHER INSIDE MOBILE MENU DRAWER */}
            <div className="notranslate bg-stone-900/90 p-3.5 rounded-2xl border border-stone-800 space-y-2.5" translate="no">
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> PILIH BAHASA / SELECT LANGUAGE
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {languagesList.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`py-2.5 px-3 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#800020] text-[#D4AF37] border-[#D4AF37]/50 font-extrabold shadow-md'
                          : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Links List */}
            <div className="grid grid-cols-1 gap-1 text-xs font-bold pt-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl transition-colors flex items-center justify-between ${
                      isActive 
                        ? 'bg-[#800020] text-[#D4AF37] font-extrabold border border-[#D4AF37]/40' 
                        : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                  </Link>
                );
              })}
            </div>

            {/* Track Order Mobile Button */}
            <div className="pt-2">
              <Link 
                href="/track-order" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#4A1313] hover:bg-[#3D0F0F] text-[#D4AF37] rounded-xl text-xs font-bold border border-[#D4AF37]/40 shadow-sm"
              >
                <PackageCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.nav.trackOrder}</span>
              </Link>
            </div>

          </div>
        )}
      </header>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
