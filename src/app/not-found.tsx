import Link from 'next/link';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ArrowLeft, Search, Package, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans text-stone-900">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-2xl mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto shadow-inner">
          <Search className="w-10 h-10" />
        </div>

        <span className="px-3 py-1 bg-[#800020] text-[#D4AF37] font-mono font-bold text-xs rounded-full uppercase tracking-widest">
          Error 404 • Page Not Found
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
          Halaman Yang Anda Cari Tidak Ditemukan
        </h1>

        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          Maaf, halaman atau tautan produk yang Anda tuju mungkin telah dipindahkan, diperbarui, atau tidak lagi tersedia di katalog FBS Bakery World.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <Home className="w-4 h-4 text-[#D4AF37]" /> Halaman Utama
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-white border border-stone-300 hover:border-[#800020] text-stone-800 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Package className="w-4 h-4 text-[#800020]" /> Lihat Katalog Produk
          </Link>
        </div>
      </main>

      <FloatingWhatsApp />
      <Footer />
    </div>
  );
}
