'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage, LanguageCode } from '@/lib/language-context';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  ChefHat, 
  BookOpen, 
  Image as ImageIcon, 
  Tag,
  Settings, 
  LogOut,
  ExternalLink,
  Sparkles,
  Globe,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const menuItems = [
    { name: t.adminNav.dashboard, href: '/admin', icon: LayoutDashboard },
    { name: t.adminNav.orders, href: '/admin/orders', icon: ShoppingBag },
    { name: t.adminNav.products, href: '/admin/products', icon: Package },
    { name: t.adminNav.categories, href: '/admin/categories', icon: Layers },
    { name: t.adminNav.recipes, href: '/admin/recipes', icon: ChefHat },
    { name: t.adminNav.blogs, href: '/admin/blogs', icon: BookOpen },
    { name: t.adminNav.banners, href: '/admin/banners', icon: ImageIcon },
    { name: t.adminNav.vouchers, href: '/admin/vouchers', icon: Tag },
    { name: t.adminNav.customers, href: '/admin/customers', icon: Users },
    { name: t.adminNav.settings, href: '/admin/settings', icon: Settings },
  ];

  const languagesList: { code: LanguageCode; label: string }[] = [
    { code: 'MS', label: 'MY' },
    { code: 'ID', label: 'ID' },
    { code: 'EN', label: 'EN' },
    { code: 'ZH', label: 'CH' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('fbs_admin_session');
    router.push('/admin/login');
  };

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const SidebarContent = (
    <div className="flex flex-col justify-between h-full min-h-screen">
      {/* Top Header & Language Selector */}
      <div>
        <div className="p-5 bg-stone-900/90 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="FBS Bakery World Logo" 
              className="w-9 h-9 rounded-full object-cover border-2 border-[#D4AF37] shadow bg-white" 
            />
            <div>
              <h1 className="font-serif text-base font-bold text-[#F7E7CE] tracking-wider">FBS CMS PORTAL</h1>
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> MODERN CONTROL
              </span>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          {onMobileClose && (
            <button 
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ULTRA-MODERN SINGLE-TEXT LANGUAGE SELECTOR */}
        <div className="p-3 mx-4 mt-3 rounded-2xl bg-stone-900/90 border border-stone-800/80 space-y-2">
          <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> BAHASA
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            {languagesList.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`py-2 text-center rounded-xl border font-black transition-all ${
                    isSelected
                      ? 'bg-[#800020] text-[#F7E7CE] border-[#D4AF37]/60 shadow-md scale-105'
                      : 'bg-stone-800/80 text-stone-400 border-stone-700/60 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Navigation List */}
        <nav className="p-4 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-230px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-[#800020] text-[#F7E7CE] font-bold shadow-lg border border-[#D4AF37]/50'
                    : 'text-stone-400 hover:bg-stone-900/60 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 bg-stone-900/90 border-t border-stone-800 space-y-2">
        <Link 
          href="/" 
          target="_blank"
          onClick={handleNavClick}
          className="flex items-center justify-between px-3.5 py-2.5 bg-[#800020]/70 hover:bg-[#800020] text-[#F7E7CE] text-xs font-bold rounded-xl border border-[#D4AF37]/30 transition-all shadow-sm group"
        >
          <span>{t.adminNav.openStore}</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-bold rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" /> {t.adminNav.signOut}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (Hidden on mobile) */}
      <aside className="hidden lg:flex w-64 bg-[#181113] text-[#FFF8F0] border-r border-[#F7E7CE]/15 shadow-2xl flex-shrink-0 min-h-screen sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* MOBILE DRAWER MODAL OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={onMobileClose}
          />

          {/* Sliding Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-[#181113] text-[#FFF8F0] shadow-2xl z-10 flex flex-col h-full overflow-hidden animate-slide-in">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
