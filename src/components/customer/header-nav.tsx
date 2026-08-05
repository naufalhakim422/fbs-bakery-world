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
  Check,
  Scale
} from 'lucide-react';

import { formatMYR } from '@/lib/currency';

export const HeaderNav: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(db.getStoreSettings());

  // Search suggestion states & refs (Sprint 1-5 Complete)
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = React.useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, wishlist, totalCompare } = useCart();
  const { language, setLanguage, t } = useLanguage();

  const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  // Instant Suggestions (Max 6 matching products)
  const suggestions = React.useMemo(() => {
    const q = norm(searchQuery);
    if (!q || q.length < 1) return [];
    const all = db.getProducts();
    return all.filter(p => 
      norm(p.productName).includes(q) ||
      norm(p.brand).includes(q) ||
      norm(p.categoryName || '').includes(q) ||
      norm(p.sku).includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpenSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
    if (searchQuery.trim().length > 0) {
      setIsOpenSuggestions(true);
    } else {
      setIsOpenSuggestions(false);
    }
  }, [searchQuery]);

  // Keyboard navigation handler (ArrowUp, ArrowDown, Enter, ESC)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpenSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        const selectedProd = suggestions[selectedIndex];
        setIsOpenSuggestions(false);
        setIsMobileMenuOpen(false);
        router.push(`/products/${selectedProd.slug}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpenSuggestions(false);
      setSelectedIndex(-1);
    }
  };

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
    setIsOpenSuggestions(false);
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
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-[#180A0E] via-[#3A0612] to-[#180A0E] text-[#FFF8F0] sticky top-0 z-40 shadow-xl border-b border-[#D4AF37]/30" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Main Header Bar */}
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Left: Brand Logo & Typography */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 notranslate" translate="no">
              <img 
                src="/logo.jpg" 
                alt="FBS Bakery World Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full object-cover shadow-md border-2 border-[#D4AF37] group-hover:scale-105 transition-transform bg-white flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="font-sans font-black text-xs sm:text-base md:text-lg lg:text-xl tracking-wider text-[#F7E7CE] uppercase leading-none whitespace-nowrap">
                  FBS BAKERY WORLD
                </span>
                <span className="hidden md:block text-[9px] lg:text-[10px] tracking-[0.18em] uppercase text-[#F7E7CE]/70 font-medium mt-1 whitespace-nowrap">
                  PREMIUM BAKING SUPPLY MALAYSIA
                </span>
              </div>
            </Link>

            {/* Middle: Integrated Search Bar (Desktop - lg and up) */}
            <div ref={searchContainerRef} className="hidden lg:flex flex-1 max-w-sm xl:max-w-md relative mx-4">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsOpenSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-8 py-2 bg-stone-900/80 border border-[#D4AF37]/40 rounded-full text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#D4AF37] transition-all backdrop-blur-md"
                />
                <button 
                  type="submit" 
                  className="absolute left-3 top-2.5 text-[#D4AF37] hover:text-white transition-colors"
                  title={t.common.search}
                  aria-label={t.common.search}
                >
                  <Search className="w-4 h-4" />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setIsOpenSuggestions(false); router.push('/products'); }}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-white text-xs font-bold"
                    aria-label={t.common.close}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Suggestion Popup (Desktop) */}
              {isOpenSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-stone-950/95 border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-fade-in text-left">
                  {suggestions.length > 0 ? (
                    <div className="py-2 divide-y divide-stone-800/60">
                      <div className="px-3.5 py-1.5 text-[10px] font-black uppercase text-[#D4AF37] tracking-wider flex items-center justify-between">
                        <span>{language === 'EN' ? 'Product Suggestions' : 'Cadangan Produk'}</span>
                        <span className="text-stone-400 font-normal text-[9px]">{suggestions.length} {language === 'EN' ? 'found' : 'ditemukan'}</span>
                      </div>
                      {suggestions.map((p, idx) => {
                        const isHighlighted = idx === selectedIndex;
                        const v = p.variants?.[0];
                        return (
                          <div
                            key={`sug-d-${p.id}`}
                            onClick={() => {
                              setIsOpenSuggestions(false);
                              router.push(`/products/${p.slug}`);
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`px-3.5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-[#800020] text-white' : 'hover:bg-white/10 text-stone-200'
                            }`}
                          >
                            <img
                              src={p.mainImage}
                              alt={p.productName}
                              className="w-9 h-9 object-cover rounded-lg border border-stone-700/60 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold truncate leading-tight">{p.productName}</div>
                              <div className="text-[10px] text-stone-400 truncate">
                                {p.categoryName || 'Baking'} • {p.brand}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs font-black text-[#D4AF37]">
                                {v ? formatMYR(v.price) : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="px-3.5 py-2 bg-stone-900/80 text-[10px] text-stone-400 flex items-center justify-between">
                        <span>↑↓ Navigasi • Enter Pilih</span>
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="text-[#D4AF37] font-bold hover:underline"
                        >
                          {language === 'EN' ? 'View All' : 'Lihat Semua'} &rarr;
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-stone-400">
                      <p className="font-semibold text-stone-300">{language === 'EN' ? 'No products found' : 'Tidak ada produk ditemukan'}</p>
                      <p className="text-[10px] text-stone-500 mt-1">
                        {language === 'EN' ? `No results for "${searchQuery}"` : `Tidak ada hasil untuk "${searchQuery}"`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions & User Buttons (Clean, Streamlined for Mobile, Tablet & Desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
              
              {/* Order Tracking Pill Button (Desktop only) */}
              <Link 
                href="/track-order" 
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4A1313] hover:bg-[#3D0F0F] text-[#D4AF37] rounded-full text-xs font-bold border border-[#D4AF37]/40 transition-all hover:scale-105 shadow-sm"
              >
                <PackageCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t.nav.trackOrder}</span>
              </Link>

              {/* Wishlist Link */}
              <Link 
                href={customerSession ? "/account" : "/account/login"} 
                className="relative p-2 text-stone-200 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-white/10" 
                title={t.customerAccount.wishlistTitle}
                aria-label={t.customerAccount.wishlistTitle}
              >
                <Heart className="w-5 h-5 text-stone-200 hover:text-[#D4AF37]" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D4AF37] text-[#800020] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Product Comparison Link (Desktop lg+) */}
              <Link 
                href="/compare" 
                className="hidden lg:flex relative p-2 text-stone-200 hover:text-[#D4AF37] transition-colors rounded-full hover:bg-white/10" 
                title="Perbandingan Produk"
                aria-label="Perbandingan Produk"
              >
                <Scale className="w-5 h-5" />
                {totalCompare > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#800020] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#D4AF37]">
                    {totalCompare}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 lg:px-3.5 lg:py-2 bg-gradient-to-r from-[#4A1313] to-[#800020] hover:brightness-110 text-[#FFF8F0] rounded-full border border-[#D4AF37]/50 transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                title={t.nav.cart}
                aria-label={t.nav.cart}
              >
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <span className="hidden lg:inline text-xs font-extrabold tracking-wide">{t.nav.cart}</span>
                <span className="bg-[#D4AF37] text-[#800020] text-[10px] sm:text-[11px] font-black px-1.5 py-0.2 rounded-full shadow">
                  {totalItems}
                </span>
              </button>

              {/* Customer Account or Login Button */}
              <Link 
                href={customerSession ? "/account" : "/account/login"} 
                className="p-2 lg:px-3 lg:py-1.5 bg-white/10 hover:bg-white/20 text-[#FFF8F0] hover:text-[#D4AF37] rounded-full border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
                title={customerSession ? `${language === 'EN' ? 'Hello' : 'Halo'}, ${customerSession.name}` : t.nav.signIn}
              >
                <User className="w-5 h-5 text-[#D4AF37]" />
                <span className="hidden lg:inline text-xs">
                  {customerSession ? customerSession.name.split(' ')[0] : t.nav.signIn}
                </span>
              </Link>

              {/* Mobile & Tablet Hamburger Menu Button (Sleek Icon Button on < lg) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] active:scale-95 rounded-xl border border-[#D4AF37]/50 shadow-md transition-all flex items-center justify-center"
                title={isMobileMenuOpen ? (language === 'EN' ? 'Close Navigation Menu' : 'Tutup Menu Navigasi') : (language === 'EN' ? 'Open Navigation Menu' : 'Buka Menu Navigasi')}
                aria-label={isMobileMenuOpen ? (language === 'EN' ? 'Close Navigation Menu' : 'Tutup Menu Navigasi') : (language === 'EN' ? 'Open Navigation Menu' : 'Buka Menu Navigasi')}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-[#D4AF37]" />
                )}
              </button>

            </div>
          </div>

          {/* Desktop Navigation Bar (Shown on lg screens and up) */}
          <div className="hidden lg:flex items-center justify-between py-2.5 border-t border-white/10 text-xs font-bold tracking-wide">
            
            {/* Inline Navigation Links */}
            <div className="flex items-center gap-5 xl:gap-8">
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

            {/* Desktop Quick Language Switcher Pills & Dark Mode Toggle */}
            <div className="flex items-center gap-2">
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
                      {lang.code === 'MS' ? 'MY' : lang.code === 'ID' ? 'ID' : 'EN'}
                    </button>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

        {/* Mobile & Tablet Expanded Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#181113] border-t border-[#F7E7CE]/20 px-4 sm:px-6 pt-4 pb-6 space-y-4 animate-fade-in shadow-2xl">
            
            {/* Mobile Search Form with Suggestion Popup */}
            <div ref={mobileSearchContainerRef} className="relative md:hidden">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsOpenSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-[#D4AF37]/40 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#D4AF37]"
                />
                <button type="submit" className="absolute left-3 top-3 text-[#D4AF37]">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Mobile Live Suggestion Popup */}
              {isOpenSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-stone-950/95 border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl animate-fade-in text-left">
                  {suggestions.length > 0 ? (
                    <div className="py-2 divide-y divide-stone-800/60">
                      <div className="px-3.5 py-1.5 text-[10px] font-black uppercase text-[#D4AF37] tracking-wider flex items-center justify-between">
                        <span>{language === 'EN' ? 'Product Suggestions' : 'Cadangan Produk'}</span>
                        <span className="text-stone-400 font-normal text-[9px]">{suggestions.length}</span>
                      </div>
                      {suggestions.map((p, idx) => {
                        const isHighlighted = idx === selectedIndex;
                        const v = p.variants?.[0];
                        return (
                          <div
                            key={`sug-m-${p.id}`}
                            onClick={() => {
                              setIsOpenSuggestions(false);
                              setIsMobileMenuOpen(false);
                              router.push(`/products/${p.slug}`);
                            }}
                            className={`px-3.5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${
                              isHighlighted ? 'bg-[#800020] text-white' : 'hover:bg-white/10 text-stone-200'
                            }`}
                          >
                            <img
                              src={p.mainImage}
                              alt={p.productName}
                              className="w-9 h-9 object-cover rounded-lg border border-stone-700/60 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold truncate leading-tight">{p.productName}</div>
                              <div className="text-[10px] text-stone-400 truncate">
                                {p.categoryName || 'Baking'} • {p.brand}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs font-black text-[#D4AF37]">
                                {v ? formatMYR(v.price) : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-stone-400">
                      <p className="font-semibold text-stone-300">{language === 'EN' ? 'No products found' : 'Tidak ada produk ditemukan'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* INTEGRATED LANGUAGE SWITCHER INSIDE MOBILE MENU DRAWER */}
            <div className="notranslate bg-stone-900/90 p-3.5 rounded-2xl border border-stone-800 space-y-2.5" translate="no">
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> {language === 'EN' ? 'SELECT LANGUAGE' : 'PILIH BAHASA'}
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

            {/* Track Order Mobile Button & Dark Mode Toggle */}
            <div className="pt-2 flex items-center gap-2">
              <Link 
                href="/track-order" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4A1313] hover:bg-[#3D0F0F] text-[#D4AF37] rounded-xl text-xs font-bold border border-[#D4AF37]/40 shadow-sm"
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
