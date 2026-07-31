import { CartItem } from './cart-context';
import { formatMYR } from './currency';

export interface WhatsAppCheckoutData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  notes?: string;
  items: CartItem[];
  subtotal: number;
  whatsappNumber: string;
}

export const formatWhatsAppNumber = (phoneStr: string): string => {
  if (!phoneStr) return '60129876543';
  const rawClean = phoneStr.replace(/[^0-9]/g, '');
  if (!rawClean) return '60129876543';

  // Already prefixed with country code 62 (Indonesia), 60 (Malaysia), 65 (Singapore)
  if (rawClean.startsWith('62') || rawClean.startsWith('60') || rawClean.startsWith('65')) {
    return rawClean;
  }

  // Indonesian local format starting with 08... (e.g. 08123456789 -> 628123456789)
  if (rawClean.startsWith('08')) {
    return '62' + rawClean.substring(1);
  }

  // Indonesian local format starting with 8... (e.g. 8123456789 -> 628123456789)
  if (rawClean.startsWith('8')) {
    return '62' + rawClean;
  }

  // Malaysian local format starting with 01... (e.g. 0123456789 -> 60123456789)
  if (rawClean.startsWith('01')) {
    return '60' + rawClean.substring(1);
  }

  // General leading zero (fallback to Malaysia 60...)
  if (rawClean.startsWith('0')) {
    return '60' + rawClean.substring(1);
  }

  return rawClean || '60129876543';
};

export const extractMapsEmbedUrl = (input?: string, fallbackAddress?: string): string => {
  if (!input || !input.trim()) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return '';
  }
  let trimmed = input.trim();
  
  // Extract src="..." or src='...' if user pasted full <iframe ...> HTML tag
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    trimmed = srcMatch[1].trim();
  } else {
    // If wrapped in HTML or quotes, extract raw URL
    const urlMatch = trimmed.match(/(https?:\/\/[^\s"'>]+)/i);
    if (urlMatch && urlMatch[1]) {
      trimmed = urlMatch[1].trim();
    }
  }

  // If already an embed URL (has /maps/embed or output=embed), return as is
  if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
    return trimmed;
  }

  // If user pasted a regular Google Maps link (e.g. maps.app.goo.gl or place URL) or address
  // Convert it into a valid Google Maps embed URL so iframe renders without 404
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

export const extractMapsAppUrl = (appUrl?: string, embedUrl?: string, address?: string): string => {
  if (appUrl && appUrl.trim()) {
    let clean = appUrl.trim();
    const urlMatch = clean.match(/(https?:\/\/[^\s"'>]+)/i);
    if (urlMatch && urlMatch[1]) {
      clean = urlMatch[1].trim();
    }
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
  }

  // Fallback: If embedUrl is available and valid, use it
  if (embedUrl && embedUrl.trim()) {
    const cleanEmbed = extractMapsEmbedUrl(embedUrl);
    if (cleanEmbed) return cleanEmbed;
  }

  // Fallback: Use warehouse address or default search query
  const targetQuery = address && address.trim() ? address.trim() : 'FBS Bakery World Malaysia';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetQuery)}`;
};

export const generateWhatsAppOrderLink = (data: WhatsAppCheckoutData): string => {
  const cleanPhone = formatWhatsAppNumber(data.whatsappNumber);

  let message = `Hello *FBS Bakery World*,\n\nI would like to place an order from website:\n\n`;
  message += `📋 *ORDER NUMBER:* ${data.orderNumber}\n\n`;
  message += `👤 *CUSTOMER DETAILS:*\n`;
  message += `• *Name:* ${data.customerName}\n`;
  message += `• *Phone:* ${data.customerPhone}\n`;
  message += `• *Address:* ${data.address}, ${data.city}, ${data.postcode}, ${data.state}\n\n`;

  message += `📦 *ORDER ITEMS:*\n`;
  data.items.forEach((item, index) => {
    const lineTotal = formatMYR(item.price * item.quantity);
    message += `${index + 1}. *${item.productName}*\n`;
    message += `   Variant: ${item.variantName} | Qty: ${item.quantity} x ${formatMYR(item.price)} = ${lineTotal}\n`;
  });

  message += `\n💰 *ESTIMATED PRODUCT TOTAL:* ${formatMYR(data.subtotal)}\n`;

  if (data.notes && data.notes.trim() !== '') {
    message += `\n📝 *NOTES:* ${data.notes.trim()}\n`;
  }

  message += `\nPlease confirm stock availability, shipping cost, and payment details.\nThank You!`;

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
};
