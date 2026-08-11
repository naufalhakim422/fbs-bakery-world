'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { formatWhatsAppNumber, cleanPhoneNumber } from '@/lib/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [waUrl, setWaUrl] = useState<string>('');

  useEffect(() => {
    const updateLink = async () => {
      let num = db.getStoreSettings().whatsappNumber;
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const serverSettings = data.settings || data;
          if (serverSettings && serverSettings.whatsappNumber) {
            num = serverSettings.whatsappNumber;
            db.updateStoreSettings(serverSettings);
          }
        }
      } catch (err) {
        console.warn('FloatingWhatsApp: Failed to fetch live settings', err);
      }

      const cleanPhone = cleanPhoneNumber(num);
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
      className="fixed bottom-5 right-4 sm:right-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center border-2 border-white transition-transform hover:scale-110 active:scale-95 cursor-pointer"
      title="Chat with Admin on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
    </a>
  );
};
