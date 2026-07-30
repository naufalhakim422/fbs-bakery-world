'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { Truck, Sparkles, ShieldCheck } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [settings, setSettings] = useState(db.getStoreSettings());
  const { t } = useLanguage();

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(db.getStoreSettings());
    };
    handleUpdate();

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fbs_db_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fbs_db_updated', handleUpdate);
    };
  }, []);

  return (
    <div className="bg-[#4A0010] text-[#FFF8F0] text-xs py-2 px-4 border-b border-[#D4AF37]/30 shadow-inner relative z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        
        {/* Left: Announcement Text */}
        <div className="flex items-center gap-2 font-medium tracking-wide" suppressHydrationWarning>
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
          <span suppressHydrationWarning>{settings.announcement}</span>
        </div>

        {/* Right: Fast Delivery + Halal Status Badge */}
        <div className="flex items-center gap-3 text-[11px] text-[#D4AF37]">
          <span className="flex items-center gap-1 font-medium">
            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" /> {t.productDetail.fastDelivery}
          </span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span className="hidden sm:flex items-center gap-1 font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Halal Certified
          </span>
        </div>

      </div>
    </div>
  );
};
