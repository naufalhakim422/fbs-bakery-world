'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

import { useLanguage } from '@/lib/language-context';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
  const [adminUser, setAdminUser] = useState<any>({ name: 'Admin User', role: 'OWNER' });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isLoginPage = pathname === '/admin/login' || pathname === '/admin2026/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsAdminLoggedIn(false);
      setIsCheckingAuth(false);
      return;
    }

    const checkAuth = () => {
      try {
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('fbs_admin_session=authenticated');
        let savedSession = localStorage.getItem('fbs_admin_session');
        if (!savedSession || !hasCookie) {
          setIsAdminLoggedIn(false);
          setIsCheckingAuth(false);
          return;
        }

        const parsed = JSON.parse(savedSession);
        setIsAdminLoggedIn(true);
        setAdminUser(parsed);
      } catch (e) {
        setIsAdminLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fbs_db_updated', handleStorageChange);

    // Load saved sidebar collapse state
    try {
      const savedCollapse = localStorage.getItem('fbs_admin_sidebar_collapsed');
      if (savedCollapse === 'true') {
        setIsSidebarCollapsed(true);
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fbs_db_updated', handleStorageChange);
    };
  }, [pathname, router, isLoginPage]);

  const toggleSidebarCollapse = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    try {
      localStorage.setItem('fbs_admin_sidebar_collapsed', String(nextState));
    } catch (e) {}
  };

  useEffect(() => {
    if (!isCheckingAuth && !isAdminLoggedIn && !isLoginPage) {
      const loginUrl = pathname?.startsWith('/admin2026') ? '/admin2026/login' : '/admin/login';
      router.push(loginUrl);
    }
  }, [isCheckingAuth, isAdminLoggedIn, isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF7F2] text-stone-700">
        <div className="w-10 h-10 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Memeriksa Sesi Admin...</p>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FAF7F2] text-stone-700 space-y-3">
        <div className="w-10 h-10 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Mengarahkan ke Halaman Login Admin...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen max-w-full overflow-hidden bg-[#FAF7F2] flex font-sans text-stone-900">
      
      {/* Collapsible Admin Sidebar */}
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Right Column Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden transition-all duration-300">
        
        {/* Fixed Topbar Header (Never scrolls away) */}
        <header className="flex-shrink-0 bg-[#1E1517] text-white border-b border-[#F7E7CE]/20 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-lg z-30 backdrop-blur-md">
          
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-stone-900 text-[#F7E7CE] border border-[#D4AF37]/30 hover:bg-stone-800 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Navbar Sidebar Expand/Collapse Toggle Button */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#800020] hover:text-white transition-all shadow text-xs font-bold"
              title={isSidebarCollapsed ? "Buka Sidebar Menu" : "Ciutkan Sidebar / Luaskan Layar Utama"}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#D4AF37]" />
                  <span>Menu</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#D4AF37]" />
                  <span>Luaskan Layar</span>
                </>
              )}
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

        {/* Dedicated Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
