import { db } from './db';

export interface FullBackupPayload {
  version: string;
  timestamp: string;
  app: string;
  data: {
    products: any[];
    categories: any[];
    orders: any[];
    customers: any[];
    banners: any[];
    blogs: any[];
    videos: any[];
    recipes: any[];
    storeSettings: any;
    aboutSettings: any;
    homePageSettings: any;
    cashflowExpenses: any[];
    productReviews: any[];
    stockLogs: any[];
  };
}

/**
 * Generate full database backup JSON object and trigger browser download
 */
export const createAndDownloadBackup = (): void => {
  const backupPayload: FullBackupPayload = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    app: 'FBS Bakery World E-Commerce',
    data: {
      products: db.getProducts(),
      categories: db.getCategories(),
      orders: db.getOrders(),
      customers: db.getCustomers(),
      banners: db.getBanners(),
      blogs: db.getBlogs(),
      videos: db.getVideos(),
      recipes: db.getRecipes(),
      storeSettings: db.getStoreSettings(),
      aboutSettings: db.getAboutSettings(),
      homePageSettings: db.getHomePageSettings(),
      cashflowExpenses: (() => {
        try {
          return JSON.parse(localStorage.getItem('fbs_cashflow_expenses') || '[]');
        } catch (e) {
          return [];
        }
      })(),
      productReviews: (() => {
        try {
          return JSON.parse(localStorage.getItem('fbs_product_reviews') || '[]');
        } catch (e) {
          return [];
        }
      })(),
      stockLogs: db.getStockLogs(),
    }
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateTag = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FBS_Bakery_Full_Backup_${dateTag}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate and restore database state from backup JSON text
 */
export const validateAndRestoreBackup = (jsonText: string): { success: boolean; message: string; details?: any } => {
  try {
    const parsed = JSON.parse(jsonText);

    // 1. Structure Validation
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'File backup bukan JSON objek yang sah.' };
    }

    if (!parsed.data || typeof parsed.data !== 'object') {
      return { success: false, message: 'File backup tidak memiliki struktur data (data payload) yang diperlukan.' };
    }

    const d = parsed.data;

    // 2. Validate essential keys presence
    if (!Array.isArray(d.products) || !Array.isArray(d.categories) || !Array.isArray(d.orders)) {
      return { success: false, message: 'File backup rosak atau kekurangan koleksi penting (Products, Categories, Orders).' };
    }

    // 3. Perform restoration to LocalStorage safely
    localStorage.setItem('fbs_products', JSON.stringify(d.products));
    localStorage.setItem('fbs_categories', JSON.stringify(d.categories));
    localStorage.setItem('fbs_orders', JSON.stringify(d.orders));

    if (Array.isArray(d.customers)) localStorage.setItem('fbs_customers', JSON.stringify(d.customers));
    if (Array.isArray(d.banners)) localStorage.setItem('fbs_banners', JSON.stringify(d.banners));
    if (Array.isArray(d.blogs)) localStorage.setItem('fbs_blogs', JSON.stringify(d.blogs));
    if (Array.isArray(d.videos)) localStorage.setItem('fbs_videos', JSON.stringify(d.videos));
    if (Array.isArray(d.recipes)) localStorage.setItem('fbs_recipes', JSON.stringify(d.recipes));
    if (d.storeSettings) localStorage.setItem('fbs_store_settings', JSON.stringify(d.storeSettings));
    if (d.aboutSettings) localStorage.setItem('fbs_about_settings', JSON.stringify(d.aboutSettings));
    if (d.homePageSettings) localStorage.setItem('fbs_homepage_settings', JSON.stringify(d.homePageSettings));
    if (Array.isArray(d.cashflowExpenses)) localStorage.setItem('fbs_cashflow_expenses', JSON.stringify(d.cashflowExpenses));
    if (Array.isArray(d.productReviews)) localStorage.setItem('fbs_product_reviews', JSON.stringify(d.productReviews));
    if (Array.isArray(d.stockLogs)) localStorage.setItem('fbs_stock_logs', JSON.stringify(d.stockLogs));

    // Dispatch update event
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('fbs_db_updated'));

    return {
      success: true,
      message: `Database berhasil dipulihkan dari backup (${new Date(parsed.timestamp || Date.now()).toLocaleString()})!`,
      details: {
        productsCount: d.products.length,
        ordersCount: d.orders.length,
        categoriesCount: d.categories.length,
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal memproses file backup: ${err?.message || 'Format JSON tidak valid'}`
    };
  }
};
