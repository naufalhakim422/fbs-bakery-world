'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useLanguage } from '@/lib/language-context';
import { User, Bell, ShieldCheck, Sparkles, Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAdminLoggedIn(false);
      return;
    }

    const session = localStorage.getItem('fbs_admin_session');
    if (!session) {
      router.push('/admin/login');
    } else {
      setIsAdminLoggedIn(true);
      setAdminUser(JSON.parse(session));
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#181113] flex items-center justify-center text-white text-xs">
        <Sparkles className="w-5 h-5 text-[#D4AF37] animate-spin mr-2" /> Checking Admin Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex font-sans text-stone-900">
      
      {/* Admin Sidebar Component (Responsive Desktop & Mobile Drawer with Integrated Language Switcher) */}
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Modern Minimalist Dark Onyx Topbar */}
        <header className="bg-[#1E1517] text-white border-b border-[#F7E7CE]/20 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-lg sticky top-0 z-30 backdrop-blur-md">
          
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-stone-900 text-[#F7E7CE] border border-[#D4AF37]/30 hover:bg-stone-800 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[9px] sm:text-[10px] font-black text-[#D4AF37] uppercase tracking-widest block mb-0.5">
                FBS BAKERY WORLD • CMS PORTAL
              </span>
              <h2 className="font-serif text-sm sm:text-lg font-bold text-[#F7E7CE] line-clamp-1">
                {t.adminNav.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Admin User Profile Tag */}
            <div className="flex items-center gap-2 sm:gap-3 bg-stone-900/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-[#D4AF37]/40 shadow-inner">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-black text-xs sm:text-sm flex items-center justify-center border border-[#D4AF37]/50 shadow">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-white">{adminUser?.name || 'Admin User'}</span>
                <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-wider">{adminUser?.role || 'OWNER'} ROLE</span>
              </div>
            </div>

          </div>

        </header>

        {/* Admin Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
