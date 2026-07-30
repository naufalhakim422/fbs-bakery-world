'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'MS' | 'ID' | 'EN' | 'ZH';

export interface Translations {
  flag: string;
  label: string;
  shortLabel: string;
  nav: {
    home: string;
    products: string;
    categories: string;
    recipes: string;
    blog: string;
    about: string;
    contact: string;
    trackOrder: string;
    cart: string;
    signIn: string;
    account: string;
  };
  searchPlaceholder: string;
  hero: {
    tagline: string;
    heading: string;
    subheading: string;
    primaryBtn: string;
    secondaryBtn: string;
  };
  sections: {
    featuredTitle: string;
    featuredSubtitle: string;
    bestsellerTitle: string;
    bestsellerSubtitle: string;
    wholesalerBannerTitle: string;
    wholesalerBannerSubtitle: string;
  };
  productDetail: {
    pricePerPack: string;
    selectVariant: string;
    quantity: string;
    addToCart: string;
    orderWhatsApp: string;
    halalCertified: string;
    fastDelivery: string;
    descriptionTitle: string;
    relatedTitle: string;
  };
  cart: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    subtotal: string;
    estimatedTotal: string;
    proceedCheckout: string;
  };
  checkout: {
    title: string;
    contactHeader: string;
    addressHeader: string;
    notesHeader: string;
    submitBtn: string;
    voucherLabel: string;
    voucherApplyBtn: string;
  };
  adminNav: {
    title: string;
    dashboard: string;
    orders: string;
    products: string;
    categories: string;
    recipes: string;
    blogs: string;
    banners: string;
    vouchers: string;
    customers: string;
    settings: string;
    openStore: string;
    signOut: string;
  };
  common: {
    exploreAll: string;
    viewDetails: string;
    readArticle: string;
    viewRecipe: string;
    trackParcel: string;
    contactSupport: string;
    allCategories: string;
    halalOnly: string;
    sortBy: string;
    reset: string;
    productsCount: string;
    noResults: string;
  };
}

const dictionaries: Record<LanguageCode, Translations> = {
  MS: {
    flag: '🇲🇾',
    label: 'Bahasa Melayu',
    shortLabel: 'BM',
    nav: {
      home: 'Beranda Utama',
      products: 'Katalog Produk',
      categories: 'Kategori Bahan',
      recipes: 'Resepi & Petua',
      blog: 'Blog Baker',
      about: 'Mengenai Kami',
      contact: 'Hubungi Kami',
      trackOrder: 'Jejak Resi',
      cart: 'Troli Belanja',
      signIn: 'Log Masuk',
      account: 'Akaun Saya',
    },
    searchPlaceholder: 'Cari tepung semolina, matcha, mentega...',
    hero: {
      tagline: 'MEMBEKAL BAHAN BAKERY HALAL GRED TINGGI',
      heading: 'Bahan Pastri & Bakeri Premium Terlengkap di Malaysia',
      subheading: 'Daripada Tepung Semolina Import, Serbuk Uji Matcha Kyoto, Coklat Belgian Beryls, hingga Mentega Anchor New Zealand. Sedia dikirim ke dapur bakeri anda.',
      primaryBtn: 'Lihat Semua Produk',
      secondaryBtn: 'Jejak Resi Pengiriman',
    },
    sections: {
      featuredTitle: 'Kategori Bahan Pilihan Utama',
      featuredSubtitle: 'Bahan pastri berkualiti tinggi yang diimport khas untuk keperluan baker rumah & kafe.',
      bestsellerTitle: 'Katalog Produk Paling Laris (Bestsellers)',
      bestsellerSubtitle: 'Produk kegemaran komuniti baker & chef pastri di seluruh Malaysia.',
      wholesalerBannerTitle: 'Bekalan Pukal & Harga Borong Khas Kafé & Toko Roti',
      wholesalerBannerSubtitle: 'Dapatkan potongan harga istimewa untuk pembelian guni 5kg & 25kg dengan khidmat penghantaran khas.',
    },
    productDetail: {
      pricePerPack: 'Harga per pek',
      selectVariant: 'Pilih Saiz Pembungkusan / Berat:',
      quantity: 'Kuantiti (Jumlah):',
      addToCart: 'Tambah ke Troli',
      orderWhatsApp: 'Pesan via WhatsApp',
      halalCertified: 'DIIKTIRAF HALAL 100%',
      fastDelivery: 'Penghantaran Pantas Seluruh Malaysia',
      descriptionTitle: 'Spesifikasi Lengkap & Panduan Penggunaan',
      relatedTitle: 'Produk Lain Yang Mungkin Anda Perlukan',
    },
    cart: {
      title: 'Troli Belanja Anda',
      subtitle: 'Semak bahan bakeri pilihan anda sebelum membuat pendaftaran keluar via WhatsApp.',
      emptyTitle: 'Troli belanja anda kosong',
      emptySubtitle: 'Terokai tepung semolina, serbuk matcha, coklat Belgian, dan mentega premium kami.',
      subtotal: 'Jumlah Subtotal Produk',
      estimatedTotal: 'Anggaran Jumlah Akhir',
      proceedCheckout: 'Lanjut ke WhatsApp Checkout',
    },
    checkout: {
      title: 'Daftar Keluar via WhatsApp',
      contactHeader: '1. Maklumat Hubungan Pelanggan',
      addressHeader: '2. Alamat Penghantaran (Malaysia)',
      notesHeader: '3. Catatan Tambahan (Opsional)',
      submitBtn: 'HANTAR & CHECKOUT VIA WHATSAPP',
      voucherLabel: 'Gunakan Kod Baucar Promo',
      voucherApplyBtn: 'Gunakan',
    },
    adminNav: {
      title: 'Portal Kawalan & Pengurusan Perniagaan',
      dashboard: 'Ringkasan Papan Pemuka',
      orders: 'Pengurusan Pesanan',
      products: 'Katalog Produk',
      categories: 'Pengurusan Kategori',
      recipes: 'CMS Pusat Resepi',
      blogs: 'Pengurusan Blog',
      banners: 'Perekabentuk Banner',
      vouchers: 'Baucar Promo',
      customers: 'Pangkalan Data Pelanggan',
      settings: 'Tetapan Kedai & WA',
      openStore: 'Buka Store Publik',
      signOut: 'Log Keluar Sesi Admin',
    },
    common: {
      exploreAll: 'Terokai Semua Produk',
      viewDetails: 'Lihat Butiran Lengkap',
      readArticle: 'Baca Artikel Baker',
      viewRecipe: 'Lihat Resepi & Bahan',
      trackParcel: 'Jejak Resi Penghantaran',
      contactSupport: 'Hubungi Khidmat Pelanggan',
      allCategories: 'Semua Kategori Bahan',
      halalOnly: 'Hanya Produk Halal 100%',
      sortBy: 'Susun Mengikut',
      reset: 'Tetap Semula Penapis',
      productsCount: 'Produk Ditemui',
      noResults: 'Tiada produk ditemui',
    },
  },
  ID: {
    flag: '🇮🇩',
    label: 'Bahasa Indonesia',
    shortLabel: 'ID',
    nav: {
      home: 'Beranda Utama',
      products: 'Katalog Produk',
      categories: 'Kategori Bahan',
      recipes: 'Resep & Tips Baking',
      blog: 'Blog Baker',
      about: 'Tentang Kami',
      contact: 'Hubungi Kami',
      trackOrder: 'Lacak Resi',
      cart: 'Keranjang Belanja',
      signIn: 'Masuk Akun',
      account: 'Akun Saya',
    },
    searchPlaceholder: 'Cari tepung, matcha, mentega, cokelat...',
    hero: {
      tagline: 'SUPLIER BAHAN BAKERY HALAL GRADE A PREMIUM',
      heading: 'Pusat Bahan Baku Roti & Pastry Terlengkap di Malaysia',
      subheading: 'Dari Tepung Semolina Impor, Uji Matcha Powder Kyoto, Cokelat Belgian Beryls, hingga Anchor Butter New Zealand. Siap diantar langsung ke toko roti Anda.',
      primaryBtn: 'Jelajahi Semua Produk',
      secondaryBtn: 'Lacak Resi Pengiriman',
    },
    sections: {
      featuredTitle: 'Kategori Bahan Utama Pilihan',
      featuredSubtitle: 'Bahan pastry berkualitas tinggi yang diimpor khusus untuk baker rumahan dan kafe.',
      bestsellerTitle: 'Katalog Produk Terlaris (Bestsellers)',
      bestsellerSubtitle: 'Produk favorit komunitas baker & pastry chef di seluruh Malaysia.',
      wholesalerBannerTitle: 'Pasokan Grosir & Harga Skala Besar Toko Roti',
      wholesalerBannerSubtitle: 'Dapatkan potongan harga khusus untuk pembelian karung 5kg & 25kg dengan layanan kargo khusus.',
    },
    productDetail: {
      pricePerPack: 'Harga per kemasan',
      selectVariant: 'Pilih Ukuran Kemasan / Berat:',
      quantity: 'Jumlah Kuantitas:',
      addToCart: 'Tambah ke Keranjang',
      orderWhatsApp: 'Pesan via WhatsApp',
      halalCertified: 'SERTIFIKAT HALAL 100%',
      fastDelivery: 'Pengiriman Cepat Seluruh Malaysia',
      descriptionTitle: 'Spesifikasi Detail & Panduan Penggunaan',
      relatedTitle: 'Produk Lain Yang Mungkin Anda Butuhkan',
    },
    cart: {
      title: 'Keranjang Belanja Anda',
      subtitle: 'Tinjau bahan pastry pilihan Anda sebelum lanjut ke checkout via WhatsApp.',
      emptyTitle: 'Keranjang belanja Anda kosong',
      emptySubtitle: 'Jelajahi tepung semolina, matcha powder, cokelat Belgian, dan mentega premium kami.',
      subtotal: 'Total Subtotal Produk',
      estimatedTotal: 'Estimasi Total Akhir',
      proceedCheckout: 'Lanjut ke WhatsApp Checkout',
    },
    checkout: {
      title: 'Checkout via WhatsApp',
      contactHeader: '1. Detail Kontak Pelanggan',
      addressHeader: '2. Alamat Pengiriman (Malaysia)',
      notesHeader: '3. Catatan Tambahan (Opsional)',
      submitBtn: 'KIRIM & CHECKOUT VIA WHATSAPP',
      voucherLabel: 'Gunakan Kode Voucher Promo',
      voucherApplyBtn: 'Gunakan',
    },
    adminNav: {
      title: 'Portal Kontrol & Manajemen Bisnis',
      dashboard: 'Ringkasan Dasbor',
      orders: 'Manajemen Pesanan',
      products: 'Katalog Produk',
      categories: 'Manajemen Kategori',
      recipes: 'CMS Pusat Resep',
      blogs: 'Manajemen Blog',
      banners: 'Pendesain Banner',
      vouchers: 'Voucher Promo',
      customers: 'Database Pelanggan',
      settings: 'Pengaturan Toko & WA',
      openStore: 'Buka Store Publik',
      signOut: 'Keluar Sesi Admin',
    },
    common: {
      exploreAll: 'Jelajahi Semua Produk',
      viewDetails: 'Lihat Detail Lengkap',
      readArticle: 'Baca Artikel Baker',
      viewRecipe: 'Lihat Resep & Bahan',
      trackParcel: 'Lacak Resi Pengiriman',
      contactSupport: 'Hubungi Layanan Pelanggan',
      allCategories: 'Semua Kategori Bahan',
      halalOnly: 'Hanya Produk Halal 100%',
      sortBy: 'Urutkan Berdasarkan',
      reset: 'Riset Filter',
      productsCount: 'Produk Ditemukan',
      noResults: 'Tidak ada produk ditemukan',
    },
  },
  EN: {
    flag: '🇬🇧',
    label: 'English',
    shortLabel: 'EN',
    nav: {
      home: 'Home',
      products: 'Products Catalog',
      categories: 'Supply Categories',
      recipes: 'Baking Recipes',
      blog: 'Baker Blog',
      about: 'About Us',
      contact: 'Contact Support',
      trackOrder: 'Track Parcel',
      cart: 'Shopping Cart',
      signIn: 'Sign In',
      account: 'My Account',
    },
    searchPlaceholder: 'Search flour, matcha, butter, chocolate...',
    hero: {
      tagline: 'PREMIUM HALAL BAKING INGREDIENTS SUPPLIER',
      heading: 'Malaysia’s Premier Bakery & Pastry Supply World',
      subheading: 'From imported Semolina Flour, Kyoto Uji Matcha, Beryls Belgian Chocolate, to New Zealand Anchor Butter. Delivered straight to your bakery kitchen.',
      primaryBtn: 'Explore All Products',
      secondaryBtn: 'Track Parcel Order',
    },
    sections: {
      featuredTitle: 'Featured Supply Categories',
      featuredSubtitle: 'High grade baking ingredients curated for home bakers, cafes, and commercial pastry chefs.',
      bestsellerTitle: 'Top Bestselling Ingredients',
      bestsellerSubtitle: 'Community favorites trusted by bakers and pastry professionals across Malaysia.',
      wholesalerBannerTitle: 'Commercial Bulk Supply & Wholesale Rates for Cafes',
      wholesalerBannerSubtitle: 'Get special volume discounts on 5kg & 25kg sacks with dedicated logistics support.',
    },
    productDetail: {
      pricePerPack: 'Price per pack',
      selectVariant: 'Select Packaging Size / Weight:',
      quantity: 'Quantity:',
      addToCart: 'Add to Cart',
      orderWhatsApp: 'Order via WhatsApp',
      halalCertified: '100% HALAL CERTIFIED',
      fastDelivery: 'Fast Delivery Across Malaysia',
      descriptionTitle: 'Detailed Specifications & Usage Guide',
      relatedTitle: 'You May Also Need',
    },
    cart: {
      title: 'Your Shopping Cart',
      subtitle: 'Review selected baking ingredients before proceeding to WhatsApp Checkout.',
      emptyTitle: 'Your shopping cart is empty',
      emptySubtitle: 'Explore our semolina flour, matcha powder, Belgian chocolate, and premium butter.',
      subtotal: 'Product Subtotal',
      estimatedTotal: 'Estimated Total',
      proceedCheckout: 'Proceed to WhatsApp Checkout',
    },
    checkout: {
      title: 'WhatsApp Checkout',
      contactHeader: '1. Customer Contact Details',
      addressHeader: '2. Delivery Address (Malaysia)',
      notesHeader: '3. Additional Notes (Optional)',
      submitBtn: 'SUBMIT & CHECKOUT VIA WHATSAPP',
      voucherLabel: 'Apply Promo Voucher Code',
      voucherApplyBtn: 'Apply',
    },
    adminNav: {
      title: 'Business Dashboard & Management Portal',
      dashboard: 'Dashboard Overview',
      orders: 'Order Management',
      products: 'Product Catalog',
      categories: 'Category Manager',
      recipes: 'Recipe Center CMS',
      blogs: 'Blog Manager',
      banners: 'Banner & Builder',
      vouchers: 'Promo Vouchers',
      customers: 'Customer Database',
      settings: 'Store & WhatsApp Settings',
      openStore: 'View Public Store',
      signOut: 'Sign Out Portal',
    },
    common: {
      exploreAll: 'Explore All Products',
      viewDetails: 'View Specifications',
      readArticle: 'Read Baker Guide',
      viewRecipe: 'View Recipe & Ingredients',
      trackParcel: 'Track Parcel Status',
      contactSupport: 'Contact Customer Service',
      allCategories: 'All Supply Categories',
      halalOnly: '100% Halal Certified Only',
      sortBy: 'Sort Ingredients By',
      reset: 'Reset Filter',
      productsCount: 'Products Found',
      noResults: 'No baking items found',
    },
  },
  ZH: {
    flag: '🇨🇳',
    label: '中文 (Chinese)',
    shortLabel: 'ZH',
    nav: {
      home: '首页',
      products: '所有烘焙原料',
      categories: '原料分类',
      recipes: '烘焙食谱',
      blog: '烘焙博客',
      about: '关于我们',
      contact: '联系客服',
      trackOrder: '追踪订单',
      cart: '购物车',
      signIn: '登录账号',
      account: '我的账号',
    },
    searchPlaceholder: '搜索面粉、抹茶、黄油、巧克力...',
    hero: {
      tagline: '马来西亚优质清真烘焙原料供应商',
      heading: '全马最齐全的高级面包与烘焙原料中心',
      subheading: '提供进口意大利面粉、京都宇治抹茶粉、比利时巧克力与纽西兰安佳黄油，直达您的烘焙工坊。',
      primaryBtn: '浏览所有产品',
      secondaryBtn: '追踪包裹单号',
    },
    sections: {
      featuredTitle: '精选烘焙原料分类',
      featuredSubtitle: '为家庭烘焙师、咖啡馆及专业糕点师精心挑选的高品质烘焙原料。',
      bestsellerTitle: '热销原料榜单',
      bestsellerSubtitle: '深受马来西亚烘焙师及甜品师信赖与喜爱的热销商品。',
      wholesalerBannerTitle: '烘焙坊与咖啡馆批发商业特惠',
      wholesalerBannerSubtitle: '购买 5kg 及 25kg 大包装享受商业批发折扣及专车配送服务。',
    },
    productDetail: {
      pricePerPack: '每包价格',
      selectVariant: '选择包装规格 / 重量:',
      quantity: '购买数量:',
      addToCart: '加入购物车',
      orderWhatsApp: '通过 WhatsApp 下单',
      halalCertified: '100% 清真认证',
      fastDelivery: '全马快速送达',
      descriptionTitle: '详细规格与使用指南',
      relatedTitle: '您可能还需要',
    },
    cart: {
      title: '您的购物车',
      subtitle: '在通过 WhatsApp 结账前核对您选择的烘焙原料。',
      emptyTitle: '您的购物车是空的',
      emptySubtitle: '探索我们的意大利面粉、宇治抹茶粉、比利时巧克力与高级黄油。',
      subtotal: '商品小计',
      estimatedTotal: '预估总价',
      proceedCheckout: '前往 WhatsApp 结账',
    },
    checkout: {
      title: '通过 WhatsApp 结账',
      contactHeader: '1. 客户联系信息',
      addressHeader: '2. 配送地址 (马来西亚)',
      notesHeader: '3. 额外备注 (可选)',
      submitBtn: '通过 WHATSAPP 提交订单',
      voucherLabel: '使用优惠券代码',
      voucherApplyBtn: '使用',
    },
    adminNav: {
      title: '商业控制面板与管理门户',
      dashboard: '仪表板概览',
      orders: '订单管理',
      products: '商品目录',
      categories: '分类管理',
      recipes: '食谱中心 CMS',
      blogs: '博客管理',
      banners: '横幅与设计',
      vouchers: '优惠券管理',
      customers: '客户数据库',
      settings: '店铺与 WhatsApp 设置',
      openStore: '打开公开商城',
      signOut: '退出管理员',
    },
    common: {
      exploreAll: '浏览所有商品',
      viewDetails: '查看商品详情',
      readArticle: '阅读烘焙指南',
      viewRecipe: '查看食谱与原料',
      trackParcel: '追踪包裹快递',
      contactSupport: '联系在线客服',
      allCategories: '所有烘焙分类',
      halalOnly: '仅显示 100% 清真产品',
      sortBy: '商品排序方式',
      reset: '重置筛选',
      productsCount: '找到的商品',
      noResults: '未找到相关烘焙原料',
    },
  },
};

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'MS',
  setLanguage: () => {},
  t: dictionaries.MS,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<LanguageCode>('MS');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fbs_language');
      if (saved && (saved === 'MS' || saved === 'ID' || saved === 'EN' || saved === 'ZH')) {
        setLangState(saved as LanguageCode);
      }
    } catch (e) {}
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLangState(lang);
    try {
      localStorage.setItem('fbs_language', lang);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fbs_db_updated', { detail: { lang } }));
    } catch (e) {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: dictionaries[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
