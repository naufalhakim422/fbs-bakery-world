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
  let cleaned = phoneStr.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '60' + cleaned.substring(1);
  } else if (cleaned.length > 0 && !cleaned.startsWith('60') && !cleaned.startsWith('62') && !cleaned.startsWith('65') && !cleaned.startsWith('1')) {
    cleaned = '60' + cleaned;
  }
  return cleaned || '60129876543';
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
