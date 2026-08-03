'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage, LanguageCode } from '@/lib/language-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { recordAuditLog } from '@/lib/audit';
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
  X,
  Wallet,
  Film
} from 'lucide-react';

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isMobileOpen, 
  onMobileClose,
  isCollapsed = false
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  const videoMenuName = language === 'ID' 
    ? 'Manajemen Video' 
    : language === 'MS' 
    ? 'Pengurusan Video' 
    : 'Video Management';

  const menuItems = [
    { name: t.adminNav.dashboard, href: '/admin', icon: LayoutDashboard },
    { name: t.adminNav.cashflow, href: '/admin/cashflow', icon: Wallet },
    { name: t.adminNav.orders, href: '/admin/orders', icon: ShoppingBag },
    { name: t.adminNav.products, href: '/admin/products', icon: Package },
    { name: t.adminNav.categories, href: '/admin/categories', icon: Layers },
    { name: t.adminNav.recipes, href: '/admin/recipes', icon: ChefHat },
    { name: t.adminNav.blogs, href: '/admin/blogs', icon: BookOpen },
    { name: videoMenuName, href: '/admin/videos', icon: Film },
    { name: t.adminNav.banners, href: '/admin/banners', icon: ImageIcon },
    { name: t.adminNav.vouchers, href: '/admin/vouchers', icon: Tag },
    { name: t.adminNav.customers, href: '/admin/customers', icon: Users },
    { name: t.adminNav.settings, href: '/admin/settings', icon: Settings },
  ];

  const languagesList: { code: LanguageCode; label: string }[] = [
    { code: 'MS', label: 'MY' },
    { code: 'ID', label: 'ID' },
    { code: 'EN', label: 'EN' },
  ];

  const handleLogout = () => {
    setIsConfirmLogoutOpen(true);
  };

  const executeLogout = () => {
    recordAuditLog('Admin Logout', 'AUTH', 'Signed out from admin session.');
    localStorage.removeItem('fbs_admin_session');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fbs_db_updated', { detail: { key: 'fbs_admin_session' } }));
    }
    router.push('/admin/login');
  };

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderSidebarContent = (collapsed: boolean) => (
    <div className="flex flex-col justify-between h-full min-h-screen">
      {/* Top Header & Language Selector */}
      <div>
        {/* Clean Sidebar Header (No cramped duplicate buttons) */}
        <div className={`p-4 bg-stone-900/90 border-b border-stone-800/80 flex items-center ${collapsed ? 'justify-center py-5' : 'justify-between'}`}>
          {!collapsed ? (
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
          ) : (
            <div className="flex items-center justify-center">
              <img 
                src="/logo.jpg" 
                alt="FBS Logo" 
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37] shadow bg-white" 
              />
            </div>
          )}

          {/* Mobile Close Button */}
          {onMobileClose && (
            <button 
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ULTRA-MODERN LANGUAGE SELECTOR */}
        {!collapsed ? (
          <div className="notranslate p-3 mx-4 mt-3 rounded-2xl bg-stone-900/90 border border-stone-800/80 space-y-2" translate="no">
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest block flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" /> BAHASA / LANGUAGE
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
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
            <div className="pt-1.5 border-t border-stone-800 flex justify-between items-center text-xs text-[#D4AF37] font-bold">
              <span>THEME MODE:</span>
              <ThemeToggle showLabelOnMobile={true} />
            </div>
          </div>
        ) : (
          <div className="notranslate p-2 my-2 flex flex-col items-center gap-1" translate="no">
            <span className="text-[8px] font-black text-[#D4AF37]">LANG</span>
            <div className="flex flex-col gap-1">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-7 h-7 text-[10px] rounded-lg font-bold border transition-all flex items-center justify-center ${
                    language === lang.code
                      ? 'bg-[#800020] text-[#F7E7CE] border-[#D4AF37]'
                      : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-white'
                  }`}
                  title={`Ganti Bahasa ke ${lang.label}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Navigation List */}
        <nav className={`p-3 space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-230px)] ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname === item.href.replace('/admin2026', '/admin');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={item.name}
                className={`flex items-center gap-3 py-3 rounded-2xl transition-all ${
                  collapsed ? 'px-3 justify-center w-11 h-11' : 'px-3.5 w-full'
                } ${
                  isActive
                    ? 'bg-[#800020] text-[#F7E7CE] font-bold shadow-lg border border-[#D4AF37]/50'
                    : 'text-stone-400 hover:bg-stone-900/60 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                {!collapsed && <span className="line-clamp-1">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 bg-stone-900/90 border-t border-stone-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Link 
            href="/" 
            target="_blank"
            onClick={handleNavClick}
            title={t.adminNav.openStore}
            className={`flex-1 flex items-center bg-[#800020]/70 hover:bg-[#800020] text-[#F7E7CE] text-xs font-bold rounded-xl border border-[#D4AF37]/30 transition-all shadow-sm group ${
              collapsed ? 'p-2.5 justify-center' : 'px-3.5 py-2.5 justify-between'
            }`}
          >
            {!collapsed && <span>{t.adminNav.openStore}</span>}
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <ThemeToggle />
        </div>

        <button
          onClick={handleLogout}
          title={t.adminNav.signOut}
          className={`w-full flex items-center justify-center gap-2 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-bold rounded-xl transition-colors ${
            collapsed ? 'p-2.5' : 'px-3.5 py-2.5'
          }`}
        >
          <LogOut className="w-4 h-4" /> {!collapsed && <span>{t.adminNav.signOut}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR WITH SMOOTH COLLAPSIBLE TRANSITION */}
      <aside className={`hidden lg:flex bg-[#181113] text-[#FFF8F0] border-r border-[#F7E7CE]/15 shadow-2xl flex-shrink-0 h-full overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {renderSidebarContent(isCollapsed)}
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
            {renderSidebarContent(false)}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmLogoutOpen}
        title={language === 'ID' ? 'Konfirmasi Keluar' : language === 'MS' ? 'Sahkan Keluar' : 'Confirm Sign Out'}
        message={language === 'ID' ? 'Apakah Anda yakin ingin keluar dari sistem admin FBS Bakery World?' : language === 'MS' ? 'Adakah anda pasti mahu keluar dari sistem admin FBS Bakery World?' : 'Are you sure you want to sign out from the FBS Bakery World admin panel?'}
        type="logout"
        onConfirm={executeLogout}
        onCancel={() => setIsConfirmLogoutOpen(false)}
      />
    </>
  );
};
