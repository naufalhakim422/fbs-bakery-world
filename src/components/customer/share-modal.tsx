'use client';

import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { formatMYR } from '@/lib/currency';
import { db } from '@/lib/db';
import { useNotification } from '@/lib/notification-context';
import { recordAuditLog } from '@/lib/audit';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Download, 
  MessageCircle, 
  Send, 
  Sparkles,
  ExternalLink,
  Globe
} from 'lucide-react';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant?: ProductVariant;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
}) => {
  const { showToast } = useNotification();
  const [activeView, setActiveView] = useState<'menu' | 'qrcode'>('menu');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !product) return null;

  const currentVariant = selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
  const currentPrice = currentVariant ? currentVariant.price : product.variants?.[0]?.price || 0;

  // Canonical product URL
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products/${product.slug}`
    : `https://fbsbaker.store/products/${product.slug}`;

  const shareTitle = `${product.productName} - FBS Bakery World`;
  const shareText = `🔍 Cek bahan baking premium "${product.productName}" (${currentVariant?.variantName || 'Baking Supply'}) seharga ${formatMYR(currentPrice)} di FBS Bakery World! 🥐✨\n\nLink Produk: ${canonicalUrl}`;

  // Platform Share Handlers
  const handleWhatsAppShare = () => {
    db.recordProductShare(product.id, product.productName, 'WHATSAPP');
    recordAuditLog('Share Product', 'SHARE', `Shared ${product.productName} via WhatsApp`);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  const handleFacebookShare = () => {
    db.recordProductShare(product.id, product.productName, 'FACEBOOK');
    recordAuditLog('Share Product', 'SHARE', `Shared ${product.productName} via Facebook`);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`;
    window.open(fbUrl, '_blank');
    onClose();
  };

  const handleTelegramShare = () => {
    db.recordProductShare(product.id, product.productName, 'TELEGRAM');
    recordAuditLog('Share Product', 'SHARE', `Shared ${product.productName} via Telegram`);
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(tgUrl, '_blank');
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setIsCopied(true);
      db.recordProductShare(product.id, product.productName, 'COPY_LINK');
      showToast('Link Produk Disalin!', 'Salin URL berhasil.', 'success');
      setTimeout(() => {
        setIsCopied(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to copy product URL:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: canonicalUrl,
        });
        db.recordProductShare(product.id, product.productName, 'NATIVE_SHARE');
        onClose();
      } catch (err) {
        console.warn('Native share cancelled or failed:', err);
      }
    }
  };

  // QR Code URL using QRServer API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(canonicalUrl)}&color=800020&bgcolor=FFFFFF`;

  const handleDownloadQrCode = async () => {
    try {
      db.recordProductShare(product.id, product.productName, 'QR_CODE');
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-${product.slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('QR Code Diunduh!', 'File gambar QR Code berhasil disimpan.', 'success');
    } catch (err) {
      console.error('Failed to download QR code:', err);
      window.open(qrCodeUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 space-y-4 p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-[#800020]">
            <Share2 className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-stone-900">Bagikan Produk</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Preview Card */}
        <div className="p-3.5 bg-[#FFF8F0] rounded-2xl border border-[#EADBC8] flex items-center gap-3.5">
          <img
            src={product.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop'}
            alt={product.productName}
            className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#800020] bg-[#800020]/10 px-2 py-0.5 rounded-md">
              {product.categoryName || 'Baking Supply'}
            </span>
            <h4 className="font-serif font-bold text-sm text-stone-900 truncate mt-1">{product.productName}</h4>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-bold text-xs text-[#800020]">{formatMYR(currentPrice)}</span>
              {currentVariant && (
                <span className="text-[11px] text-stone-500 font-mono">({currentVariant.variantName})</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Switcher: Menu Share vs QR Code */}
        <div className="flex bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveView('menu')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeView === 'menu' ? 'bg-white text-[#800020] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Opsi Bagikan
          </button>
          <button
            onClick={() => setActiveView('qrcode')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeView === 'qrcode' ? 'bg-white text-[#800020] shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Scan QR Code
          </button>
        </div>

        {/* VIEW 1: SHARE MENU */}
        {activeView === 'menu' && (
          <div className="space-y-4 pt-1">
            {/* Social Share Grid */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <span className="text-xs font-bold text-emerald-900">WhatsApp</span>
              </button>

              <button
                onClick={handleFacebookShare}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FacebookIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-blue-900">Facebook</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-sky-900">Telegram</span>
              </button>
            </div>

            {/* Native Device Share (If supported) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-[#D4AF37]" /> Bagikan via Aplikasi HP
              </button>
            )}

            {/* Copy Link Bar */}
            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">Salin Tautan Produk</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={canonicalUrl}
                  className="flex-1 px-3 py-2 border border-stone-300 bg-stone-50 rounded-xl text-xs text-stone-700 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    isCopied ? 'bg-emerald-600 text-white' : 'bg-[#800020] hover:bg-[#6F1D1B] text-white active:scale-95'
                  }`}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {isCopied ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: QR CODE */}
        {activeView === 'qrcode' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            <div className="p-4 bg-white rounded-3xl border-2 border-[#800020]/20 shadow-lg flex flex-col items-center">
              <img
                src={qrCodeUrl}
                alt={`QR Code ${product.productName}`}
                className="w-48 h-48 object-contain"
              />
              <span className="text-[10px] text-stone-500 font-mono mt-2">Scan dengan kamera HP untuk buka produk</span>
            </div>

            <button
              onClick={handleDownloadQrCode}
              className="w-full py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" /> Unduh Gambar QR Code (PNG)
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
