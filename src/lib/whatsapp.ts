export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '601139560924';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '60' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('60') && cleaned.length >= 9) {
    cleaned = '60' + cleaned;
  }
  return cleaned;
}

export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return '+60 11-3956 0924';
  const clean = cleanPhoneNumber(phone);
  if (clean.startsWith('60')) {
    return `+60 ${clean.slice(2, 4)}-${clean.slice(4, 8)} ${clean.slice(8)}`;
  }
  return `+${clean}`;
}

export function normalizePhoneDigits(phoneStr?: string): string {
  if (!phoneStr) return '';
  let clean = phoneStr.replace(/[^0-9]/g, '');
  while (clean.startsWith('0')) {
    clean = clean.substring(1);
  }
  if (clean.startsWith('60')) {
    clean = clean.substring(2);
  } else if (clean.startsWith('62')) {
    clean = clean.substring(2);
  }
  while (clean.startsWith('0')) {
    clean = clean.substring(1);
  }
  return clean;
}

export function getCourierTrackingUrl(courierName?: string, trackingNumber?: string): string {
  if (!trackingNumber) return '#';
  const clean = trackingNumber.trim();
  const cName = (courierName || '').toLowerCase();
  if (cName.includes('j&t') || cName.includes('jnt')) {
    return `https://www.jtexpress.my/tracking/${clean}`;
  }
  if (cName.includes('pos') || cName.includes('laju')) {
    return `https://www.pos.com.my/tracking/${clean}`;
  }
  if (cName.includes('ninja')) {
    return `https://www.ninjavan.co/en-my/tracking?id=${clean}`;
  }
  if (cName.includes('dhl')) {
    return `https://www.dhl.com/my-en/home/tracking.html?tracking-id=${clean}`;
  }
  if (cName.includes('flash')) {
    return `https://www.flashexpress.my/fle/tracking?se=${clean}`;
  }
  return `https://www.tracking.my/${clean}`;
}

export function extractMapsEmbedUrl(rawUrl?: string, address?: string): string {
  if (rawUrl && rawUrl.includes('google.com/maps')) {
    return rawUrl;
  }
  const query = address ? encodeURIComponent(address) : 'FBS%20Bakery%20World%2C%20Chukai%2C%20Terengganu';
  return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export function extractMapsAppUrl(appUrl?: string, embedUrl?: string, address?: string): string {
  if (appUrl && appUrl.trim() !== '') return appUrl;
  const query = address ? encodeURIComponent(address) : 'FBS+Bakery+World+Chukai+Terengganu';
  return `https://maps.google.com/?q=${query}`;
}

export function generateSingleProductWALink(
  whatsappNumber: string,
  productName: string,
  price: number,
  quantity: number = 1
): string {
  const cleanPhone = cleanPhoneNumber(whatsappNumber || '+601139560924');
  const msg = `Helo FBS Bakery! Saya berminat untuk membeli:\n\n- ${productName} (Kuantiti: ${quantity}x)\nHarga: RM ${(price * quantity).toFixed(2)}\n\nBoleh sahkan ketersediaan stok & proses penghantaran? Terima kasih!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function generateCartWALink(
  whatsappNumber: string,
  cartItems: any[],
  subtotal: number,
  customerName?: string
): string {
  const cleanPhone = cleanPhoneNumber(whatsappNumber || '+601139560924');
  const itemsText = cartItems
    .map((item, idx) => `${idx + 1}. ${item.name} (${item.quantity}x) — RM ${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const msg = `Helo FBS Bakery! Saya ingin membuat pesanan keranjang:\n\n${itemsText}\n\nJumlah: RM ${subtotal.toFixed(2)}\n\nSila bantu proses tempahan ini. Terima kasih!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function generateWhatsAppOrderLink(params: {
  whatsappNumber: string;
  template?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city?: string;
  state?: string;
  postcode?: string;
  notes?: string;
  courierName?: string;
  courier?: any;
  items?: any[];
  itemsSummary?: string;
  total?: number;
  grandTotal?: number;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  [key: string]: any;
}): string {
  const {
    whatsappNumber,
    template,
    orderNumber,
    customerName,
    customerPhone,
    address,
    city,
    state,
    postcode,
    notes,
    courierName,
    courier,
    items,
    itemsSummary = '',
    total = 0,
    grandTotal = 0,
    subtotal = 0,
    discount = 0,
    shippingFee = 0,
  } = params;

  const cleanPhone = cleanPhoneNumber(whatsappNumber || '+601139560924');
  const fullAddr = [address, city, state, postcode].filter(Boolean).join(', ');

  // Auto-format itemsSummary from items array if not provided
  let formattedItems = itemsSummary;
  if (!formattedItems && Array.isArray(items) && items.length > 0) {
    formattedItems = items.map((item, idx) => {
      const name = item.productName || item.name || 'Produk Bakery';
      const variant = item.variantName ? ` (${item.variantName})` : '';
      const qty = item.quantity || 1;
      const price = item.price || 0;
      return `${idx + 1}. ${name}${variant} - ${qty}x @ RM ${price.toFixed(2)}`;
    }).join('\n');
  }

  const finalTotal = (total && total > 0) ? total : (grandTotal && grandTotal > 0) ? grandTotal : Math.max(0, (subtotal || 0) + (shippingFee || 0) - (discount || 0));
  const finalItemsText = formattedItems || 'Bahan Kue Bakery';

  const defaultMsg = `Helo FBS Bakery! Saya ingin mengesahkan pesanan #${orderNumber}.

👤 Nama: ${customerName}
📞 Telefon: ${customerPhone}
📍 Alamat Penghantaran:
${fullAddr || address}

📦 Barangan Pesanan:
${finalItemsText}

---------------------------
Jumlah Kecil: RM ${(subtotal || 0).toFixed(2)}
Diskaun: RM ${(discount || 0).toFixed(2)}
Kos Penghantaran: RM ${(shippingFee || 0).toFixed(2)}
💰 Jumlah Keseluruhan: RM ${finalTotal.toFixed(2)}

Terima kasih!`;

  let formattedMessage = template || defaultMsg;
  formattedMessage = formattedMessage
    .replace(/{storeName}/g, 'FBS Bakery')
    .replace(/{orderNumber}/g, orderNumber)
    .replace(/{customerName}/g, customerName)
    .replace(/{customerPhone}/g, customerPhone)
    .replace(/{address}/g, fullAddr || address)
    .replace(/{itemsSummary}/g, finalItemsText)
    .replace(/{total}/g, finalTotal.toFixed(2));

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedMessage)}`;
}
