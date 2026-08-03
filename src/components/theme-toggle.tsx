'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabelOnMobile?: boolean;
}

export function ThemeToggle({ 
  className = '',
  showLabelOnMobile = false 
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme || 'light';
  const isDark = currentTheme === 'dark';

  const labelClass = showLabelOnMobile 
    ? "text-xs font-black uppercase tracking-wider" 
    : "text-xs font-black uppercase tracking-wider hidden sm:inline";

  if (!mounted) {
    return (
      <button
        type="button"
        className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border-2 bg-[#800020] border-[#D4AF37] text-[#D4AF37] flex items-center justify-center gap-1.5 shadow-md flex-shrink-0 cursor-pointer ${className}`}
        aria-label="Toggle Theme Mode"
      >
        <Moon className="w-4 h-4 text-[#D4AF37]" />
        <span className={`${labelClass} text-[#D4AF37]`}>Dark 🌙</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border-2 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md flex-shrink-0 cursor-pointer ${
        isDark
          ? 'bg-stone-900 border-amber-400 text-amber-300 hover:bg-stone-800 ring-2 ring-amber-400/30'
          : 'bg-[#800020] border-[#D4AF37] text-[#D4AF37] hover:bg-[#6F1D1B]'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
      aria-label="Toggle Theme Mode"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
          <span className={`${labelClass} text-amber-200`}>Light ☀️</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-[#D4AF37] transition-transform duration-300 hover:-rotate-12" />
          <span className={`${labelClass} text-[#D4AF37]`}>Dark 🌙</span>
        </>
      )}
    </button>
  );
}
