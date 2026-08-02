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
  const defaultEmbed = "https://maps.google.com/maps?q=FBS%20Bakery%20World%2C%20K9694%2CK9695%2CK9696%20%26%20K9697%2C%20Taman%20Pajak%20Utama%2C%2024000%20Chukai%2C%20Terengganu%2C%20Malaysia&t=&z=15&ie=UTF8&iwloc=&output=embed";

  if (!input || !input.trim()) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return defaultEmbed;
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

  // Replace &amp; with &
  trimmed = trimmed.replace(/&amp;/g, '&');

  // Sanitize old dummy Kuala Lumpur embed URLs or old pb parameters
  if (trimmed.includes('Kuala%20Lumpur') || trimmed.includes('0x31cc362807480d39') || trimmed.includes('101.686855') || trimmed.includes('Shah%20Alam')) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return defaultEmbed;
  }

  // If it's a standard Google Maps embed URL with /maps/embed or pb= parameter, return as clean HTTPS URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
      return trimmed;
    }
    // Handle standard Google Maps place/search URLs or maps.google.com URLs that aren't formatted as embed
    if (trimmed.includes('google.com/maps') || trimmed.includes('maps.google.com')) {
      // Check if there's a place query or pb parameter
      const pbMatch = trimmed.match(/pb=([^&]+)/);
      if (pbMatch) {
        return `https://www.google.com/maps/embed?pb=${pbMatch[1]}`;
      }
      const qMatch = trimmed.match(/[?&]q=([^&]+)/) || trimmed.match(/\/place\/([^/]+)/);
      if (qMatch && qMatch[1]) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(qMatch[1]))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    }
  }

  // Shortlinks like maps.app.goo.gl or goo.gl/maps cannot be embedded directly in iframes across devices/browsers
  // Fallback to searching the warehouse address if available
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl')) {
    if (fallbackAddress && fallbackAddress.trim()) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // If user pasted an address or place query, convert into valid Google Maps embed URL
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
  const cleanPhone = formatWhatsAppNumber(data.whatsappNumber || '60129876543');

  let message = `🛒 *FBS BAKERY WORLD - OFFICIAL ORDER*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📋 *Order ID:* ${data.orderNumber || '#ORD-ONLINE'}\n`;
  message += `👤 *Customer Name:* ${data.customerName || 'Pelanggan'}\n`;
  if (data.customerPhone) {
    message += `📞 *Phone:* ${data.customerPhone}\n`;
  }
  if (data.address) {
    message += `📍 *Delivery Address:* ${data.address}${data.city ? `, ${data.city}` : ''}${data.postcode ? ` ${data.postcode}` : ''}${data.state ? `, ${data.state}` : ''}\n`;
  }
  message += `\n📦 *ORDERED ITEMS:*\n`;

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      const lineTotal = formatMYR(item.price * item.quantity);
      message += `${index + 1}. *${item.productName}*\n`;
      message += `   • Variant: ${item.variantName}\n`;
      message += `   • Qty: ${item.quantity} x ${formatMYR(item.price)} = *${lineTotal}*\n`;
    });
  } else {
    message += `• Product Inquiry / Quick Order\n`;
  }

  message += `\n💰 *TOTAL ESTIMATE:* *${formatMYR(data.subtotal || 0)}*\n`;

  if (data.notes && data.notes.trim()) {
    message += `\n📝 *Notes:* ${data.notes.trim()}\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Please confirm stock availability, delivery fees, and bank account details. Thank you! 🙏`;

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
};
