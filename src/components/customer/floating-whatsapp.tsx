'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { formatWhatsAppNumber } from '@/lib/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [waUrl, setWaUrl] = useState<string>('');

  useEffect(() => {
    const updateLink = () => {
      const settings = db.getStoreSettings();
      const cleanPhone = formatWhatsAppNumber(settings.whatsappNumber);
      setWaUrl(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello FBS Bakery World, I have an inquiry regarding baking supplies.')}`);
    };
    updateLink();

    window.addEventListener('storage', updateLink);
    window.addEventListener('fbs_db_updated', updateLink);
    return () => {
      window.removeEventListener('storage', updateLink);
      window.removeEventListener('fbs_db_updated', updateLink);
    };
  }, []);

  if (!waUrl) return null;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 group transition-all duration-300 hover:scale-105 border-2 border-white"
      title="Chat with Admin on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white animate-bounce" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-xs font-extrabold pr-2">
        Chat With Admin
      </span>
    </a>
  );
};
