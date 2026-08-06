import { formatWhatsAppNumber } from '@/lib/whatsapp';

export interface WhatsAppNotificationPayload {
  customerPhone: string;
  customerName: string;
  orderNumber: string;
  status: string;
  courierName?: string;
  trackingNumber?: string;
  totalAmount?: number;
}

export function generateAutomatedWhatsAppMessage(payload: WhatsAppNotificationPayload): string {
  const { customerPhone, customerName, orderNumber, status, courierName, trackingNumber, totalAmount } = payload;
  const cleanPhone = formatWhatsAppNumber(customerPhone);

  const statusTextMap: Record<string, string> = {
    PENDING_PAYMENT: 'Menunggu Pembayaran',
    PAYMENT_VERIFIED: 'Pembayaran Terverifikasi',
    CONFIRMED: 'Pesanan Dikonfirmasi',
    PACKING: 'Sedang Dikemas di Gudang',
    READY_TO_SHIP: 'Siap Dikirim via Kurir',
    SHIPPING: 'Dalam Pengiriman ke Alamat Anda',
    DELIVERED: 'Pesanan Telah Diterima',
    COMPLETED: 'Pesanan Telah Selesai',
    CANCELLED: 'Pesanan Dibatalkan',
  };

  const statusTitle = statusTextMap[status] || status;

  let message = `Halo ${customerName},\n\nUpdate Otomatis Pesanan *${orderNumber}* dari FBS Bakery World:\nStatus Terbaru: *${statusTitle}*`;

  if (totalAmount) {
    message += `\nTotal Pembayaran: RM ${totalAmount.toFixed(2)}`;
  }

  if (trackingNumber) {
    message += `\n\nEkspedisi: ${courierName || 'J&T Express'}\nNomor Resi: *${trackingNumber}*\nLacak Paket Anda: https://www.fbsbaker.store/track-order?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(customerPhone)}`;
  }

  message += `\n\nTerima kasih telah berbelanja di FBS Bakery World! 🥖✨`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
