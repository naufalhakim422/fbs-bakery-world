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
    clearCart: string;
    continueShopping: string;
    addMore: string;
    orderSummary: string;
    totalItems: string;
    items: string;
    deliveryFee: string;
    confirmedViaWA: string;
    paymentNote: string;
    freeShippingAdd: string;
    freeShippingUnlocked: string;
    variant: string;
    sku: string;
    removeItem: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    contactHeader: string;
    addressHeader: string;
    notesHeader: string;
    submitBtn: string;
    submitting: string;
    voucherLabel: string;
    voucherApplyBtn: string;
    voucherPlaceholder: string;
    voucherApplied: string;
    voucherNotFound: string;
    voucherMinSpend: string;
    fullName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    postcode: string;
    state: string;
    notesPlaceholder: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    addressPlaceholder: string;
    orderItems: string;
    subtotalProduk: string;
    discountVoucher: string;
    finalTotal: string;
    formNote: string;
    emptyCart: string;
    emptyCartNote: string;
    browseCatalog: string;
    autoFillNote: string;
    changeAddress: string;
    orderSuccess: string;
    orderRegistered: string;
    thankYou: string;
    orderStatus: string;
    totalAmount: string;
    phone: string;
    deliveryAddress: string;
    openWAAgain: string;
    trackOrderStatus: string;
    errorCreating: string;
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
    cashflow: string;
  };
  adminLogin: {
    title: string;
    subtitle: string;
    usernameLabel: string;
    passwordLabel: string;
    signInBtn: string;
    authenticating: string;
    returnToStore: string;
    activeCreds: string;
    wrongCreds: string;
    showPassword: string;
    hidePassword: string;
  };
  adminDashboard: {
    welcome: string;
    subtitle: string;
    totalRevenue: string;
    totalOrders: string;
    totalProducts: string;
    totalCustomers: string;
    revenueChart: string;
    recentOrders: string;
    topProducts: string;
    orderNumber: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
    viewAll: string;
    period7d: string;
    period30d: string;
    period90d: string;
    periodCustom: string;
    from: string;
    to: string;
  };
  adminOrders: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterNew: string;
    filterProcessing: string;
    filterShipped: string;
    filterDelivered: string;
    filterCancelled: string;
    thOrder: string;
    thCustomer: string;
    thItems: string;
    thTotal: string;
    thStatus: string;
    thDate: string;
    thAction: string;
    noOrders: string;
    viewDetail: string;
    updateStatus: string;
    orderDetail: string;
    backToOrders: string;
    customerInfo: string;
    orderItems: string;
    shippingAddress: string;
    notes: string;
    timeline: string;
  };
  adminProducts: {
    title: string;
    subtitle: string;
    addNew: string;
    searchPlaceholder: string;
    thImage: string;
    thName: string;
    thCategory: string;
    thPrice: string;
    thStock: string;
    thStatus: string;
    thAction: string;
    edit: string;
    delete: string;
    noProducts: string;
    active: string;
    draft: string;
    newProduct: string;
    editProduct: string;
    productName: string;
    productSlug: string;
    productDesc: string;
    productCategory: string;
    productImage: string;
    productVariants: string;
    saveProduct: string;
    saving: string;
  };
  adminCategories: {
    title: string;
    subtitle: string;
    addNew: string;
    nameLabel: string;
    slugLabel: string;
    descLabel: string;
    imageLabel: string;
    saveBtn: string;
    editBtn: string;
    deleteBtn: string;
    cancelBtn: string;
    noCategories: string;
    confirmDelete: string;
  };
  adminBlogs: {
    title: string;
    subtitle: string;
    createNew: string;
    searchPlaceholder: string;
    thTitle: string;
    thType: string;
    thDate: string;
    thStatus: string;
    thAction: string;
    edit: string;
    delete: string;
    publish: string;
    unpublish: string;
    noBlogs: string;
    typeArticle: string;
    typeVideo: string;
    blogTitle: string;
    blogSlug: string;
    blogExcerpt: string;
    blogContent: string;
    blogImage: string;
    blogVideoUrl: string;
    saveDraft: string;
    publishBtn: string;
  };
  adminBanners: {
    title: string;
    subtitle: string;
    addNew: string;
    thImage: string;
    thTitle: string;
    thLink: string;
    thStatus: string;
    thAction: string;
    edit: string;
    delete: string;
    noBanners: string;
    bannerTitle: string;
    bannerSubtitle: string;
    bannerLink: string;
    bannerImage: string;
    saveBtn: string;
  };
  adminVouchers: {
    title: string;
    subtitle: string;
    addNew: string;
    thCode: string;
    thTitle: string;
    thDiscount: string;
    thMinSpend: string;
    thStatus: string;
    thAction: string;
    edit: string;
    delete: string;
    noVouchers: string;
    voucherCode: string;
    voucherTitle: string;
    discountType: string;
    discountValue: string;
    minSpend: string;
    statusActive: string;
    statusInactive: string;
    saveBtn: string;
  };
  adminCustomers: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterRetail: string;
    filterWholesale: string;
    thName: string;
    thEmail: string;
    thPhone: string;
    thType: string;
    thOrders: string;
    thSpent: string;
    thJoined: string;
    noCustomers: string;
  };
  adminRecipes: {
    title: string;
    subtitle: string;
    addNew: string;
    thTitle: string;
    thCategory: string;
    thDifficulty: string;
    thStatus: string;
    thAction: string;
    edit: string;
    delete: string;
    noRecipes: string;
  };
  adminSettings: {
    title: string;
    subtitle: string;
    storeInfo: string;
    storeName: string;
    storeDesc: string;
    whatsappNumber: string;
    adminCredentials: string;
    adminEmail: string;
    adminPassword: string;
    saveSettings: string;
    saving: string;
    saved: string;
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
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    actions: string;
    view: string;
    detail: string;
    upload: string;
    download: string;
    export: string;
    import: string;
    print: string;
    publish: string;
    unpublish: string;
    approve: string;
    reject: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    all: string;
    none: string;
    required: string;
    optional: string;
  };
  trustBadges: {
    b1Title: string;
    b1Desc: string;
    b2Title: string;
    b2Desc: string;
    b3Title: string;
    b3Desc: string;
    b4Title: string;
    b4Desc: string;
  };
  adminCashflow: {
    title: string;
    subtitle: string;
    addExpenseBtn: string;
    card1Label: string;
    card1Sub: string;
    card2Label: string;
    card2Sub: string;
    card3Label: string;
    card3Sub: string;
    card4Label: string;
    card4Sub: string;
    journalTitle: string;
    filterLabel: string;
    filterAll: string;
    thDate: string;
    thType: string;
    thCategory: string;
    thDesc: string;
    thAmount: string;
    thAction: string;
    inflowTag: string;
    outflowTag: string;
  };
  customerAccount: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    forgotTitle: string;
    forgotSubtitle: string;
    dashboardTitle: string;
    dashboardSubtitle: string;
    phoneOrEmail: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    loginBtn: string;
    registerBtn: string;
    resetBtn: string;
    loggingIn: string;
    registering: string;
    noAccount: string;
    hasAccount: string;
    forgotPassword: string;
    orContinueWith: string;
    rememberMe: string;
    logoutBtn: string;
    profileTitle: string;
    orderHistory: string;
    wishlistTitle: string;
    addressBook: string;
    editProfile: string;
    saveProfile: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    wrongCredentials: string;
    emailExists: string;
    phoneExists: string;
    passwordMismatch: string;
    passwordMinLength: string;
    verifyIdentity: string;
    enterOtp: string;
    securityCheck: string;
    showPassword: string;
    hidePassword: string;
    rateLimitWarning: string;
    accountLocked: string;
    returnToStore: string;
  };
  faq: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    noResults: string;
    contactUs: string;
    contactNote: string;
  };
  status: {
    new: string;
    processing: string;
    shipped: string;
    delivered: string;
    cancelled: string;
    active: string;
    inactive: string;
    draft: string;
    published: string;
    pending: string;
    completed: string;
    refunded: string;
  };
  adminExtra: {
    // Dashboard
    liveMetrics: string;
    revenueToday: string;
    revenueMonth: string;
    today: string;
    thisMonth: string;
    bestSeller: string;
    noDataYet: string;
    sold: string;
    lowStock: string;
    products: string;
    restockRequired: string;
    stockHealthy: string;
    chartTitle: string;
    chartSubtitle: string;
    days7: string;
    days30: string;
    year1: string;
    calendar: string;
    fromDate: string;
    toDate: string;
    chartAutoUpdate: string;
    totalOmset: string;
    totalOrders: string;
    avgOrder: string;
    order: string;
    orders: string;
    omsetLabel: string;
    ordersLabel: string;
    dateLabel: string;
    noDataPeriod: string;
    manageResi: string;
    // Quick Shortcuts
    shortcutCategories: string;
    shortcutRecipes: string;
    shortcutBlogs: string;
    shortcutVouchers: string;
    shortcutCustomers: string;
    shortcutSettings: string;
    // Recent Orders Table
    recentWAOrders: string;
    recentWAOrdersSub: string;
    viewAllOrders: string;
    thPhotoProduct: string;
    thOrderNumber: string;
    thWACustomer: string;
    thTotalPayment: string;
    thStatusResi: string;
    thAdminAction: string;
    bakingPackage: string;
    variant: string;
    item: string;
    items: string;
    chatWA: string;
    pendingResi: string;
    resiNumber: string;
    processOrder: string;
    viewDetailOrder: string;
    // Stock Alert
    stockAlertTitle: string;
    stockAlertSub: string;
    stockRemaining: string;
    restockNow: string;
    stockSafe: string;

    // Cashflow
    cfFilterTimeRange: string;
    cfAvgPerPeriod: string;
    cfPeakHighest: string;
    cfStatusPerformance: string;
    cfHealthy: string;
    cfWarning: string;
    cfTotalInflow: string;
    cfTotalOutflow: string;
    cfNetProfit: string;
    cfOrderSales: string;
    cfAuto: string;
    cfReduceNet: string;
    cfDateLabel: string;
    cfCategoryLabel: string;
    cfDescLabel: string;
    cfAmountLabel: string;
    cfCancel: string;
    cfSave: string;
    cfActive: string;
    cfCatHPP: string;
    cfCatPackaging: string;
    cfCatCourier: string;
    cfCatWarehouse: string;
    cfCatOther: string;
    cfNoExpenses: string;

    // Orders Page
    ordersTitle: string;
    ordersSubtitle: string;
    ordersThPhoto: string;
    ordersThOrderNo: string;
    ordersThCustomer: string;
    ordersThTotal: string;
    ordersThStatus: string;
    ordersThAction: string;
    ordersResiPending: string;
    ordersNoOrders: string;

    // Order Detail Page
    orderNotFound: string;
    orderBackToList: string;
    orderCustomerName: string;
    orderDeliveryAddress: string;
    orderCustomerNote: string;
    orderNoNote: string;
    orderItemsOrdered: string;
    orderItemQty: string;
    orderTotal: string;
    orderUpdateStatus: string;
    orderTrackingNo: string;
    orderTrackingPlaceholder: string;
    orderSaveTracking: string;
    orderTimeline: string;
    orderPrintInvoice: string;
    orderPrintReceipt: string;
    orderChatCustomer: string;

    // Products Page
    productsExport: string;
    productsImport: string;
    productsDeleteConfirm: string;
    productsVariants: string;
    productsSKU: string;
    productsStock: string;
    productsPrice: string;

    // Videos Page
    videosTitle: string;
    videosSubtitle: string;
    videosAddNew: string;
    videosThThumbnail: string;
    videosThTitle: string;
    videosThPlatform: string;
    videosThStatus: string;
    videosThAction: string;
    videosNoVideos: string;
    videosVideoTitle: string;
    videosVideoUrl: string;
    videosPlatform: string;
    videosSaveVideo: string;
    videosUploadFile: string;
    videosUploadMP4: string;

    // Settings Page
    settingsTabStore: string;
    settingsTabBackup: string;
    settingsTabAudit: string;
    settingsBackupTitle: string;
    settingsBackupSub: string;
    settingsBackupBtn: string;
    settingsRestoreBtn: string;
    settingsAuditTitle: string;
    settingsAuditSub: string;
    settingsAuditNoLogs: string;

    // Customers Page
    customersMemberTier: string;
    customersTierRetail: string;
    customersTierVIP: string;
    customersTierWholesale: string;

    // Blogs Page
    blogsUploadMP4: string;

    // Categories Page
    categoriesUploadFile: string;

    // Common Admin
    uploadFile: string;
    confirmDeleteTitle: string;
    confirmDeleteMsg: string;
    noData: string;
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
      blog: 'Blog Kemas Kini',
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
      clearCart: 'Kosongkan Semua Troli',
      continueShopping: 'Teruskan Membeli-belah',
      addMore: 'Tambah Lagi Produk ke Pesanan',
      orderSummary: 'Ringkasan Pesanan',
      totalItems: 'Jumlah Item',
      items: 'Item',
      deliveryFee: 'Kos Penghantaran',
      confirmedViaWA: 'Disahkan melalui WhatsApp',
      paymentNote: 'Pembayaran & kos penghantaran disahkan terus oleh admin kami melalui WhatsApp selepas pesanan dihantar.',
      freeShippingAdd: 'Tambah lagi untuk PENGHANTARAN PERCUMA',
      freeShippingUnlocked: '🎉 Penghantaran Percuma diaktifkan ke seluruh Malaysia!',
      variant: 'Varian',
      sku: 'SKU',
      removeItem: 'Buang item',
    },
    checkout: {
      title: 'Daftar Keluar via WhatsApp',
      subtitle: 'Masukkan butiran penghantaran anda dan gunakan baucar promo untuk menjana mesej pesanan WhatsApp anda.',
      contactHeader: '1. Maklumat Hubungan Pelanggan',
      addressHeader: '2. Alamat Penghantaran (Malaysia)',
      notesHeader: '3. Catatan Tambahan (Opsional)',
      submitBtn: 'HANTAR & CHECKOUT VIA WHATSAPP',
      submitting: 'Menjana Pesanan...',
      voucherLabel: 'Gunakan Kod Baucar Promo',
      voucherApplyBtn: 'Gunakan',
      voucherPlaceholder: 'Contoh: VIPBAKER20',
      voucherApplied: 'Baucar Terpasang',
      voucherNotFound: 'Kod baucar tidak dijumpai atau tidak aktif.',
      voucherMinSpend: 'Pembelian minimum untuk baucar ini adalah RM',
      fullName: 'Nama Penuh',
      phoneNumber: 'Nombor Telefon WhatsApp',
      streetAddress: 'Alamat Jalan / Unit / Bangunan',
      city: 'Bandar / Pekan',
      postcode: 'Poskod',
      state: 'Negeri',
      notesPlaceholder: 'Contoh: Penghantaran segera diperlukan, sila balut dengan bubble wrap tambahan.',
      namePlaceholder: 'Contoh: Ahmad Naufal',
      phonePlaceholder: 'Contoh: +60123456789',
      addressPlaceholder: 'Contoh: No 45, Jalan Bunga Raya 7/2, Seksyen 7',
      orderItems: 'Item Pesanan',
      subtotalProduk: 'Subtotal Produk',
      discountVoucher: 'Diskaun Baucar',
      finalTotal: 'Jumlah Akhir',
      formNote: 'Menghantar borang ini mencipta ID Pesanan anda dan membuka mesej pra-format terus ke talian sokongan WhatsApp kami.',
      emptyCart: 'Troli anda kosong',
      emptyCartNote: 'Sila tambah produk bakeri ke troli anda sebelum meneruskan ke daftar keluar.',
      browseCatalog: 'Layari Katalog',
      autoFillNote: '⚡ Alamat Pengiriman Otomatis Terisi: Data alamat diambil dari profil akun Anda.',
      changeAddress: 'Ubah Alamat Akaun',
      orderSuccess: 'Pesanan Berjaya Didaftarkan',
      orderRegistered: 'Pesanan',
      thankYou: 'Terima kasih! Pesanan anda telah disimpan dalam sistem kami dan dialihkan ke Admin WhatsApp.',
      orderStatus: 'Status Pesanan',
      totalAmount: 'Jumlah Keseluruhan',
      phone: 'Telefon',
      deliveryAddress: 'Alamat Penghantaran',
      openWAAgain: 'Buka WhatsApp Sekali Lagi',
      trackOrderStatus: 'Jejak Status Pesanan',
      errorCreating: 'Ralat mencipta pesanan. Sila cuba lagi.',
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
      cashflow: 'Laporan Aliran Tunai',
    },
    adminLogin: {
      title: 'Log Masuk Portal Admin',
      subtitle: 'Masukkan kelayakan anda untuk mengakses papan pemuka pengurusan kedai.',
      usernameLabel: 'Nama Pengguna / E-mel',
      passwordLabel: 'Kata Laluan',
      signInBtn: 'Log Masuk ke Papan Pemuka',
      authenticating: 'Mengesahkan...',
      returnToStore: '← Kembali ke Laman Utama Kedai',
      activeCreds: 'Kelayakan Admin Aktif:',
      wrongCreds: 'Nama pengguna atau kata laluan salah.',
      showPassword: 'Tunjuk kata laluan',
      hidePassword: 'Sembunyikan kata laluan',
    },
    adminDashboard: {
      welcome: 'Selamat Datang ke Papan Pemuka',
      subtitle: 'Ringkasan prestasi perniagaan anda.',
      totalRevenue: 'Jumlah Pendapatan',
      totalOrders: 'Jumlah Pesanan',
      totalProducts: 'Jumlah Produk',
      totalCustomers: 'Jumlah Pelanggan',
      revenueChart: 'Carta Pendapatan',
      recentOrders: 'Pesanan Terkini',
      topProducts: 'Produk Terlaris',
      orderNumber: 'No. Pesanan',
      customer: 'Pelanggan',
      amount: 'Jumlah',
      status: 'Status',
      date: 'Tarikh',
      viewAll: 'Lihat Semua',
      period7d: '7 Hari',
      period30d: '30 Hari',
      period90d: '90 Hari',
      periodCustom: 'Kustom',
      from: 'Dari',
      to: 'Hingga',
    },
    adminOrders: {
      title: 'Pengurusan Pesanan',
      subtitle: 'Urus semua pesanan pelanggan dari satu tempat.',
      searchPlaceholder: 'Cari pesanan...',
      filterAll: 'Semua',
      filterNew: 'Baru',
      filterProcessing: 'Dalam Proses',
      filterShipped: 'Dihantar',
      filterDelivered: 'Diterima',
      filterCancelled: 'Dibatalkan',
      thOrder: 'PESANAN',
      thCustomer: 'PELANGGAN',
      thItems: 'ITEM',
      thTotal: 'JUMLAH',
      thStatus: 'STATUS',
      thDate: 'TARIKH',
      thAction: 'TINDAKAN',
      noOrders: 'Tiada pesanan dijumpai.',
      viewDetail: 'Lihat Butiran',
      updateStatus: 'Kemaskini Status',
      orderDetail: 'Butiran Pesanan',
      backToOrders: '← Kembali ke Senarai Pesanan',
      customerInfo: 'Maklumat Pelanggan',
      orderItems: 'Item Pesanan',
      shippingAddress: 'Alamat Penghantaran',
      notes: 'Catatan',
      timeline: 'Garis Masa',
    },
    adminProducts: {
      title: 'Pengurusan Katalog Produk',
      subtitle: 'Urus semua produk bahan bakeri anda.',
      addNew: 'Tambah Produk Baru',
      searchPlaceholder: 'Cari produk...',
      thImage: 'GAMBAR',
      thName: 'NAMA PRODUK',
      thCategory: 'KATEGORI',
      thPrice: 'HARGA',
      thStock: 'STOK',
      thStatus: 'STATUS',
      thAction: 'TINDAKAN',
      edit: 'Sunting',
      delete: 'Padam',
      noProducts: 'Tiada produk dijumpai.',
      active: 'Aktif',
      draft: 'Draf',
      newProduct: 'Produk Baru',
      editProduct: 'Sunting Produk',
      productName: 'Nama Produk',
      productSlug: 'Slug Produk',
      productDesc: 'Penerangan Produk',
      productCategory: 'Kategori Produk',
      productImage: 'Gambar Produk',
      productVariants: 'Varian Produk',
      saveProduct: 'Simpan Produk',
      saving: 'Menyimpan...',
    },
    adminCategories: {
      title: 'Pengurusan Kategori',
      subtitle: 'Urus kategori bahan bakeri.',
      addNew: 'Tambah Kategori Baru',
      nameLabel: 'Nama Kategori',
      slugLabel: 'Slug',
      descLabel: 'Penerangan',
      imageLabel: 'URL Gambar',
      saveBtn: 'Simpan',
      editBtn: 'Sunting',
      deleteBtn: 'Padam',
      cancelBtn: 'Batal',
      noCategories: 'Tiada kategori dijumpai.',
      confirmDelete: 'Adakah anda pasti mahu memadamkan kategori ini?',
    },
    adminBlogs: {
      title: 'Pengurusan Blog Kemas Kini',
      subtitle: 'Urus artikel dan video kemas kini.',
      createNew: 'Cipta Pos Baru',
      searchPlaceholder: 'Cari blog...',
      thTitle: 'TAJUK',
      thType: 'JENIS',
      thDate: 'TARIKH',
      thStatus: 'STATUS',
      thAction: 'TINDAKAN',
      edit: 'Sunting',
      delete: 'Padam',
      publish: 'Terbit',
      unpublish: 'Nyahterbit',
      noBlogs: 'Tiada blog dijumpai.',
      typeArticle: 'Artikel',
      typeVideo: 'Video',
      blogTitle: 'Tajuk Blog',
      blogSlug: 'Slug',
      blogExcerpt: 'Ringkasan',
      blogContent: 'Kandungan',
      blogImage: 'URL Gambar',
      blogVideoUrl: 'URL Video',
      saveDraft: 'Simpan Draf',
      publishBtn: 'Terbitkan',
    },
    adminBanners: {
      title: 'Pengurusan Banner',
      subtitle: 'Urus banner promosi kedai.',
      addNew: 'Tambah Banner Baru',
      thImage: 'GAMBAR',
      thTitle: 'TAJUK',
      thLink: 'PAUTAN',
      thStatus: 'STATUS',
      thAction: 'TINDAKAN',
      edit: 'Sunting',
      delete: 'Padam',
      noBanners: 'Tiada banner dijumpai.',
      bannerTitle: 'Tajuk Banner',
      bannerSubtitle: 'Subtajuk',
      bannerLink: 'URL Pautan Produk',
      bannerImage: 'URL Gambar',
      saveBtn: 'Simpan Banner',
    },
    adminVouchers: {
      title: 'Pengurusan Baucar Promo',
      subtitle: 'Urus baucar diskaun untuk pelanggan.',
      addNew: 'Tambah Baucar Baru',
      thCode: 'KOD',
      thTitle: 'TAJUK',
      thDiscount: 'DISKAUN',
      thMinSpend: 'MIN. BELANJA',
      thStatus: 'STATUS',
      thAction: 'TINDAKAN',
      edit: 'Sunting',
      delete: 'Padam',
      noVouchers: 'Tiada baucar dijumpai.',
      voucherCode: 'Kod Baucar',
      voucherTitle: 'Tajuk Baucar',
      discountType: 'Jenis Diskaun',
      discountValue: 'Nilai Diskaun',
      minSpend: 'Min. Belanja (RM)',
      statusActive: 'Aktif',
      statusInactive: 'Tidak Aktif',
      saveBtn: 'Simpan Baucar',
    },
    adminCustomers: {
      title: 'Pangkalan Data Pelanggan',
      subtitle: 'Lihat dan urus semua pelanggan berdaftar.',
      searchPlaceholder: 'Cari pelanggan...',
      filterAll: 'Semua',
      filterRetail: 'Runcit',
      filterWholesale: 'Borong',
      thName: 'NAMA',
      thEmail: 'E-MEL',
      thPhone: 'TELEFON',
      thType: 'JENIS',
      thOrders: 'PESANAN',
      thSpent: 'BELANJA',
      thJoined: 'TARIKH DAFTAR',
      noCustomers: 'Tiada pelanggan dijumpai.',
    },
    adminRecipes: {
      title: 'CMS Pusat Resepi',
      subtitle: 'Urus resepi bakeri dan panduan masakan.',
      addNew: 'Tambah Resepi Baru',
      thTitle: 'TAJUK',
      thCategory: 'KATEGORI',
      thDifficulty: 'KESUKARAN',
      thStatus: 'STATUS',
      thAction: 'TINDAKAN',
      edit: 'Sunting',
      delete: 'Padam',
      noRecipes: 'Tiada resepi dijumpai.',
    },
    adminSettings: {
      title: 'Tetapan Kedai & WhatsApp',
      subtitle: 'Konfigurasi maklumat kedai dan kelayakan admin.',
      storeInfo: 'Maklumat Kedai',
      storeName: 'Nama Kedai',
      storeDesc: 'Penerangan Kedai',
      whatsappNumber: 'Nombor WhatsApp',
      adminCredentials: 'Kelayakan Admin',
      adminEmail: 'E-mel Admin',
      adminPassword: 'Kata Laluan Admin',
      saveSettings: 'Simpan Tetapan',
      saving: 'Menyimpan...',
      saved: 'Disimpan!',
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
      loading: 'Memuatkan...',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Padam',
      edit: 'Sunting',
      create: 'Cipta',
      update: 'Kemaskini',
      search: 'Cari',
      filter: 'Tapis',
      actions: 'Tindakan',
      view: 'Lihat',
      detail: 'Butiran',
      upload: 'Muat Naik',
      download: 'Muat Turun',
      export: 'Eksport',
      import: 'Import',
      print: 'Cetak',
      publish: 'Terbit',
      unpublish: 'Nyahterbit',
      approve: 'Luluskan',
      reject: 'Tolak',
      back: 'Kembali',
      next: 'Seterusnya',
      previous: 'Sebelumnya',
      close: 'Tutup',
      confirm: 'Sahkan',
      yes: 'Ya',
      no: 'Tidak',
      or: 'atau',
      and: 'dan',
      all: 'Semua',
      none: 'Tiada',
      required: 'Wajib',
      optional: 'Pilihan',
    },
    trustBadges: {
      b1Title: '100% Diiktiraf Halal',
      b1Desc: 'Sijil Halal rasmi Malaysia & Indonesia',
      b2Title: 'Import Gred Premium',
      b2Desc: 'Terus dari Italy, Belgium & New Zealand',
      b3Title: 'Penghantaran Pantas',
      b3Desc: 'Kirim hari ini ke seluruh MY & ID',
      b4Title: 'Diskaun Borong Baker',
      b4Desc: 'Harga khas kemasan guni 5kg & 25kg',
    },
    adminCashflow: {
      title: 'Laporan Aliran Tunai (Cashflow Ledger)',
      subtitle: 'Modul kewangan khas untuk mencatat tunai masuk (jualan), tunai keluar (HPP & operasional), untung bersih, serta penyata kewangan real-time.',
      addExpenseBtn: 'Catat Perbelanjaan Tunai Baru',
      card1Label: '1. TUNAI MASUK (INFLOW)',
      card1Sub: 'Carta Jualan Harian',
      card2Label: '2. TUNAI KELUAR (OUTFLOW)',
      card2Sub: 'Carta Pecahan Kategori',
      card3Label: '3. UNTUNG BERSIH (NET)',
      card3Sub: 'Carta Perbandingan Masuk vs Keluar',
      card4Label: '4. MARGIN UNTUNG (%)',
      card4Sub: 'Carta Sasaran & Kecekapan',
      journalTitle: 'Jurnal Transaksi Aliran Tunai',
      filterLabel: 'Tapis Kategori:',
      filterAll: 'Semua Kategori',
      thDate: 'TARIKH',
      thType: 'JENIS TUNAI',
      thCategory: 'KATEGORI',
      thDesc: 'KETERANGAN TRANSAKSI',
      thAmount: 'JUMLAH (MYR)',
      thAction: 'TINDAKAN',
      inflowTag: 'TUNAI MASUK',
      outflowTag: 'TUNAI KELUAR',
    },
    customerAccount: {
      loginTitle: 'Log Masuk ke Akaun Anda',
      loginSubtitle: 'Masukkan butiran anda untuk mengakses akaun pelanggan.',
      registerTitle: 'Daftar Akaun Baru',
      registerSubtitle: 'Cipta akaun untuk menikmati pengalaman membeli-belah yang lebih mudah.',
      forgotTitle: 'Lupa Kata Laluan',
      forgotSubtitle: 'Masukkan telefon/e-mel untuk menetapkan semula kata laluan anda.',
      dashboardTitle: 'Papan Pemuka Akaun Saya',
      dashboardSubtitle: 'Urus profil, pesanan, dan senarai hajat anda.',
      phoneOrEmail: 'Telefon / E-mel',
      password: 'Kata Laluan',
      confirmPassword: 'Sahkan Kata Laluan',
      fullName: 'Nama Penuh',
      phoneNumber: 'Nombor Telefon',
      emailAddress: 'Alamat E-mel',
      loginBtn: 'Log Masuk',
      registerBtn: 'Daftar Sekarang',
      resetBtn: 'Tetap Semula Kata Laluan',
      loggingIn: 'Mengesahkan...',
      registering: 'Mendaftar...',
      noAccount: 'Belum ada akaun?',
      hasAccount: 'Sudah ada akaun?',
      forgotPassword: 'Lupa kata laluan?',
      orContinueWith: 'atau teruskan dengan',
      rememberMe: 'Ingat saya',
      logoutBtn: 'Log Keluar',
      profileTitle: 'Profil Saya',
      orderHistory: 'Sejarah Pesanan',
      wishlistTitle: 'Senarai Hajat',
      addressBook: 'Buku Alamat',
      editProfile: 'Sunting Profil',
      saveProfile: 'Simpan Profil',
      address: 'Alamat',
      city: 'Bandar',
      state: 'Negeri',
      postcode: 'Poskod',
      wrongCredentials: 'Telefon/e-mel atau kata laluan salah.',
      emailExists: 'E-mel ini sudah didaftarkan.',
      phoneExists: 'Nombor telefon ini sudah didaftarkan.',
      passwordMismatch: 'Kata laluan tidak sepadan.',
      passwordMinLength: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.',
      verifyIdentity: 'Sahkan Identiti',
      enterOtp: 'Masukkan OTP',
      securityCheck: 'Pemeriksaan Keselamatan',
      showPassword: 'Tunjuk kata laluan',
      hidePassword: 'Sembunyikan kata laluan',
      rateLimitWarning: 'Terlalu banyak percubaan. Sila tunggu sebentar.',
      accountLocked: 'Akaun dikunci sementara. Sila cuba lagi selepas',
      returnToStore: '← Kembali ke Kedai',
    },
    faq: {
      title: 'Soalan Lazim (FAQ)',
      subtitle: 'Jawapan kepada soalan yang sering ditanya tentang produk dan perkhidmatan kami.',
      searchPlaceholder: 'Cari soalan...',
      noResults: 'Tiada soalan dijumpai yang sepadan dengan carian anda.',
      contactUs: 'Hubungi Kami',
      contactNote: 'Tidak menemui jawapan anda? Hubungi kami melalui WhatsApp.',
    },
    status: {
      new: 'Baru',
      processing: 'Dalam Proses',
      shipped: 'Dihantar',
      delivered: 'Diterima',
      cancelled: 'Dibatalkan',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      draft: 'Draf',
      published: 'Diterbitkan',
      pending: 'Menunggu',
      completed: 'Selesai',
      refunded: 'Dipulangkan',
    },
    adminExtra: {
      liveMetrics: 'TINJAUAN METRIK KEDAI LANGSUNG',
      revenueToday: 'PENDAPATAN HARI INI',
      revenueMonth: 'PENDAPATAN BULAN INI',
      today: 'Hari ini',
      thisMonth: 'Bulan Ini',
      bestSeller: 'PRODUK TERLARIS',
      noDataYet: 'Tiada Data',
      sold: 'Dijual',
      lowStock: 'STOK SUSUT',
      products: 'Produk',
      restockRequired: 'Perlu Restok Segera →',
      stockHealthy: 'Stok Selamat',
      chartTitle: 'Grafik Analitik Jualan & Hasil Interaktif',
      chartSubtitle: 'Klik sebarang titik carta atau bar untuk melihat butiran transaksi segera.',
      days7: '7 Hari',
      days30: '30 Hari',
      year1: '1 Tahun',
      calendar: 'Kalendar',
      fromDate: 'Dari Tarikh:',
      toDate: 'Sehingga Tarikh:',
      chartAutoUpdate: '✓ Carta dikemas kini secara automatik mengikut tarikh yang dipilih',
      totalOmset: 'Jumlah Hasil',
      totalOrders: 'Jumlah Pesanan',
      avgOrder: 'Purata / Pesanan',
      order: 'Pesanan',
      orders: 'Pesanan',
      omsetLabel: 'Hasil',
      ordersLabel: 'Pesanan',
      dateLabel: 'Tarikh',
      noDataPeriod: 'Tiada data dalam tempoh ini',
      manageResi: 'Urus Resi Pesanan →',
      shortcutCategories: 'Kategori',
      shortcutRecipes: 'Resepi & Video',
      shortcutBlogs: 'Blog CMS',
      shortcutVouchers: 'Baucar Diskaun',
      shortcutCustomers: 'CRM Pelanggan',
      shortcutSettings: 'Tetapan',
      recentWAOrders: 'Pesanan WhatsApp Terkini',
      recentWAOrdersSub: 'Senarai transaksi masuk dari katalog produk kedai.',
      viewAllOrders: 'Lihat Semua Pesanan',
      thPhotoProduct: 'FOTO & ITEM PRODUK',
      thOrderNumber: 'NO. PESANAN',
      thWACustomer: 'PELANGGAN WHATSAPP',
      thTotalPayment: 'JUMLAH PEMBAYARAN',
      thStatusResi: 'STATUS & RESI',
      thAdminAction: 'TINDAKAN ADMIN',
      bakingPackage: 'Pakej Bahan Kek',
      variant: 'Varian',
      item: 'Item',
      items: 'Item',
      chatWA: 'Sembang WA',
      pendingResi: 'Resi Belum Diisi',
      resiNumber: 'Resi',
      processOrder: 'Proses Pesanan',
      viewDetailOrder: 'Lihat Butiran',
      stockAlertTitle: 'Amaran Stok Kritikal',
      stockAlertSub: 'produk dengan stok rendah yang memerlukan restok segera.',
      stockRemaining: 'Baki stok',
      restockNow: 'Restok Sekarang →',
      stockSafe: 'Semua stok dalam keadaan sihat!',
      cfFilterTimeRange: 'Tapis Julat Masa Carta',
      cfAvgPerPeriod: 'Purata Per Tempoh',
      cfPeakHighest: 'Puncak Tertinggi',
      cfStatusPerformance: 'Status Prestasi',
      cfHealthy: 'Sihat',
      cfWarning: 'Amaran',
      cfTotalInflow: 'Jumlah Aliran Masuk',
      cfTotalOutflow: 'Jumlah Aliran Keluar',
      cfNetProfit: 'Untung Bersih',
      cfOrderSales: 'Jualan Pesanan',
      cfAuto: 'Auto',
      cfReduceNet: 'Mengurangkan aliran tunai bersih secara langsung.',
      cfDateLabel: 'Tarikh',
      cfCategoryLabel: 'Kategori',
      cfDescLabel: 'Penerangan Transaksi',
      cfAmountLabel: 'Jumlah (MYR)',
      cfCancel: 'Batal',
      cfSave: 'Simpan',
      cfActive: 'Aktif',
      cfCatHPP: 'Pembelian Stok (HPP)',
      cfCatPackaging: 'Kos Pembungkusan',
      cfCatCourier: 'Kos Kurier & Logistik',
      cfCatWarehouse: 'Operasi Gudang & Elektrik',
      cfCatOther: 'Perbelanjaan Lain',
      cfNoExpenses: 'Tiada perbelanjaan direkodkan.',
      ordersTitle: 'Pengurusan Pesanan',
      ordersSubtitle: 'Urus pesanan WhatsApp pelanggan, sahkan pembayaran, dan keluarkan nombor resi penghantaran.',
      ordersThPhoto: 'FOTO & PRODUK DIBELI',
      ordersThOrderNo: 'NO. PESANAN',
      ordersThCustomer: 'PELANGGAN WHATSAPP',
      ordersThTotal: 'JUMLAH BAYAR',
      ordersThStatus: 'STATUS & RESI',
      ordersThAction: 'TINDAKAN ADMIN',
      ordersResiPending: 'Resi Belum Diisi',
      ordersNoOrders: 'Tiada pesanan dijumpai.',
      orderNotFound: 'Pesanan Tidak Dijumpai',
      orderBackToList: '← Kembali ke Senarai Pesanan',
      orderCustomerName: 'Nama & Telefon Pelanggan:',
      orderDeliveryAddress: 'Alamat Penghantaran:',
      orderCustomerNote: 'Catatan Pelanggan:',
      orderNoNote: 'Tiada catatan',
      orderItemsOrdered: 'Item Dipesan',
      orderItemQty: 'Kuan.',
      orderTotal: 'Jumlah Pesanan',
      orderUpdateStatus: 'Kemaskini Status',
      orderTrackingNo: 'Nombor Penjejakan / Resi',
      orderTrackingPlaceholder: 'Masukkan nombor resi...',
      orderSaveTracking: 'Simpan',
      orderTimeline: 'Garis Masa Pesanan',
      orderPrintInvoice: 'Cetak Invois',
      orderPrintReceipt: 'Cetak Resit',
      orderChatCustomer: 'Sembang WhatsApp',
      productsExport: 'Eksport CSV',
      productsImport: 'Import CSV',
      productsDeleteConfirm: 'Adakah anda pasti mahu memadamkan produk ini?',
      productsVariants: 'Varian',
      productsSKU: 'SKU',
      productsStock: 'Stok',
      productsPrice: 'Harga',
      videosTitle: 'Pengurusan Video',
      videosSubtitle: 'Urus video tutorial dan promosi.',
      videosAddNew: 'Tambah Video Baru',
      videosThThumbnail: 'LAKARAN KECIL',
      videosThTitle: 'TAJUK',
      videosThPlatform: 'PLATFORM',
      videosThStatus: 'STATUS',
      videosThAction: 'TINDAKAN',
      videosNoVideos: 'Tiada video dijumpai.',
      videosVideoTitle: 'Tajuk Video',
      videosVideoUrl: 'URL Video',
      videosPlatform: 'Platform',
      videosSaveVideo: 'Simpan Video',
      videosUploadFile: 'Muat Naik Fail',
      videosUploadMP4: 'Muat Naik MP4 / WebM',
      settingsTabStore: 'Tetapan Kedai',
      settingsTabBackup: 'Sandaran & Pemulihan',
      settingsTabAudit: 'Log Audit',
      settingsBackupTitle: 'Sandaran & Pemulihan Data',
      settingsBackupSub: 'Sandarkan atau pulihkan data kedai anda.',
      settingsBackupBtn: 'Muat Turun Sandaran',
      settingsRestoreBtn: 'Pulihkan dari Fail',
      settingsAuditTitle: 'Log Audit Admin',
      settingsAuditSub: 'Rekod semua aktiviti admin.',
      settingsAuditNoLogs: 'Tiada log audit.',
      customersMemberTier: 'PERINGKAT AHLI',
      customersTierRetail: 'Peringkat: RUNCIT',
      customersTierVIP: 'Peringkat: VIP',
      customersTierWholesale: 'Peringkat: BORONG B2B',
      blogsUploadMP4: 'Muat Naik MP4 / WebM',
      categoriesUploadFile: 'Muat Naik Fail',
      uploadFile: 'Muat Naik Fail',
      confirmDeleteTitle: 'Sahkan Pemadaman',
      confirmDeleteMsg: 'Adakah anda pasti mahu memadamkan item ini?',
      noData: 'Tiada data',
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
      blog: 'Blog Update',
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
      clearCart: 'Kosongkan Semua Keranjang',
      continueShopping: 'Lanjutkan Belanja',
      addMore: 'Tambah Produk Lain ke Pesanan',
      orderSummary: 'Ringkasan Pesanan',
      totalItems: 'Total Item',
      items: 'Item',
      deliveryFee: 'Biaya Pengiriman',
      confirmedViaWA: 'Dikonfirmasi via WhatsApp',
      paymentNote: 'Pembayaran & biaya pengiriman dikonfirmasi langsung oleh admin kami via WhatsApp setelah pesanan dikirim.',
      freeShippingAdd: 'Tambah lagi untuk GRATIS ONGKIR',
      freeShippingUnlocked: '🎉 Gratis Ongkir telah diaktifkan ke seluruh Malaysia!',
      variant: 'Varian',
      sku: 'SKU',
      removeItem: 'Hapus item',
    },
    checkout: {
      title: 'Checkout via WhatsApp',
      subtitle: 'Masukkan detail pengiriman Anda dan gunakan kode voucher promo untuk membuat pesan pesanan WhatsApp.',
      contactHeader: '1. Detail Kontak Pelanggan',
      addressHeader: '2. Alamat Pengiriman (Malaysia)',
      notesHeader: '3. Catatan Tambahan (Opsional)',
      submitBtn: 'KIRIM & CHECKOUT VIA WHATSAPP',
      submitting: 'Membuat Pesanan...',
      voucherLabel: 'Gunakan Kode Voucher Promo',
      voucherApplyBtn: 'Gunakan',
      voucherPlaceholder: 'Contoh: VIPBAKER20',
      voucherApplied: 'Voucher Terpasang',
      voucherNotFound: 'Kode voucher tidak ditemukan atau tidak aktif.',
      voucherMinSpend: 'Minimal belanja untuk voucher ini adalah RM',
      fullName: 'Nama Lengkap',
      phoneNumber: 'Nomor Telepon WhatsApp',
      streetAddress: 'Alamat Jalan / Unit / Gedung',
      city: 'Kota / Kabupaten',
      postcode: 'Kode Pos',
      state: 'Negara Bagian',
      notesPlaceholder: 'Contoh: Pengiriman segera diperlukan, tolong bungkus dengan bubble wrap tambahan.',
      namePlaceholder: 'Contoh: Ahmad Naufal',
      phonePlaceholder: 'Contoh: +60123456789',
      addressPlaceholder: 'Contoh: No 45, Jalan Bunga Raya 7/2, Section 7',
      orderItems: 'Item Pesanan',
      subtotalProduk: 'Subtotal Produk',
      discountVoucher: 'Diskon Voucher',
      finalTotal: 'Total Akhir',
      formNote: 'Mengirim formulir ini membuat ID Pesanan Anda dan membuka pesan pra-format langsung ke jalur dukungan WhatsApp kami.',
      emptyCart: 'Keranjang Anda kosong',
      emptyCartNote: 'Silakan tambah produk bakery ke keranjang Anda sebelum melanjutkan ke checkout.',
      browseCatalog: 'Jelajahi Katalog',
      autoFillNote: '⚡ Alamat Pengiriman Otomatis Terisi: Data alamat diambil dari profil akun Anda.',
      changeAddress: 'Ubah Alamat Akun',
      orderSuccess: 'Pesanan Berhasil Terdaftar',
      orderRegistered: 'Pesanan',
      thankYou: 'Terima kasih! Pesanan Anda telah disimpan dalam sistem kami dan dialihkan ke Admin WhatsApp.',
      orderStatus: 'Status Pesanan',
      totalAmount: 'Total Jumlah',
      phone: 'Telepon',
      deliveryAddress: 'Alamat Pengiriman',
      openWAAgain: 'Buka WhatsApp Lagi',
      trackOrderStatus: 'Lacak Status Pesanan',
      errorCreating: 'Error membuat pesanan. Silakan coba lagi.',
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
      cashflow: 'Laporan Arus Kas',
    },
    adminLogin: {
      title: 'Masuk Portal Admin',
      subtitle: 'Masukkan kredensial Anda untuk mengakses dashboard manajemen toko.',
      usernameLabel: 'Username / Email',
      passwordLabel: 'Kata Sandi',
      signInBtn: 'Masuk ke Dashboard',
      authenticating: 'Mengautentikasi...',
      returnToStore: '← Kembali ke Halaman Utama Toko',
      activeCreds: 'Kredensial Admin Aktif:',
      wrongCreds: 'Username atau kata sandi salah.',
      showPassword: 'Tampilkan kata sandi',
      hidePassword: 'Sembunyikan kata sandi',
    },
    adminDashboard: {
      welcome: 'Selamat Datang di Dashboard',
      subtitle: 'Ringkasan performa bisnis Anda.',
      totalRevenue: 'Total Pendapatan',
      totalOrders: 'Total Pesanan',
      totalProducts: 'Total Produk',
      totalCustomers: 'Total Pelanggan',
      revenueChart: 'Grafik Pendapatan',
      recentOrders: 'Pesanan Terbaru',
      topProducts: 'Produk Terlaris',
      orderNumber: 'No. Pesanan',
      customer: 'Pelanggan',
      amount: 'Jumlah',
      status: 'Status',
      date: 'Tanggal',
      viewAll: 'Lihat Semua',
      period7d: '7 Hari',
      period30d: '30 Hari',
      period90d: '90 Hari',
      periodCustom: 'Kustom',
      from: 'Dari',
      to: 'Sampai',
    },
    adminOrders: {
      title: 'Manajemen Pesanan',
      subtitle: 'Kelola semua pesanan pelanggan dari satu tempat.',
      searchPlaceholder: 'Cari pesanan...',
      filterAll: 'Semua',
      filterNew: 'Baru',
      filterProcessing: 'Diproses',
      filterShipped: 'Dikirim',
      filterDelivered: 'Diterima',
      filterCancelled: 'Dibatalkan',
      thOrder: 'PESANAN',
      thCustomer: 'PELANGGAN',
      thItems: 'ITEM',
      thTotal: 'TOTAL',
      thStatus: 'STATUS',
      thDate: 'TANGGAL',
      thAction: 'AKSI',
      noOrders: 'Tidak ada pesanan ditemukan.',
      viewDetail: 'Lihat Detail',
      updateStatus: 'Perbarui Status',
      orderDetail: 'Detail Pesanan',
      backToOrders: '← Kembali ke Daftar Pesanan',
      customerInfo: 'Informasi Pelanggan',
      orderItems: 'Item Pesanan',
      shippingAddress: 'Alamat Pengiriman',
      notes: 'Catatan',
      timeline: 'Timeline',
    },
    adminProducts: {
      title: 'Manajemen Katalog Produk',
      subtitle: 'Kelola semua produk bahan bakery Anda.',
      addNew: 'Tambah Produk Baru',
      searchPlaceholder: 'Cari produk...',
      thImage: 'GAMBAR',
      thName: 'NAMA PRODUK',
      thCategory: 'KATEGORI',
      thPrice: 'HARGA',
      thStock: 'STOK',
      thStatus: 'STATUS',
      thAction: 'AKSI',
      edit: 'Edit',
      delete: 'Hapus',
      noProducts: 'Tidak ada produk ditemukan.',
      active: 'Aktif',
      draft: 'Draf',
      newProduct: 'Produk Baru',
      editProduct: 'Edit Produk',
      productName: 'Nama Produk',
      productSlug: 'Slug Produk',
      productDesc: 'Deskripsi Produk',
      productCategory: 'Kategori Produk',
      productImage: 'Gambar Produk',
      productVariants: 'Varian Produk',
      saveProduct: 'Simpan Produk',
      saving: 'Menyimpan...',
    },
    adminCategories: {
      title: 'Manajemen Kategori',
      subtitle: 'Kelola kategori bahan bakery.',
      addNew: 'Tambah Kategori Baru',
      nameLabel: 'Nama Kategori',
      slugLabel: 'Slug',
      descLabel: 'Deskripsi',
      imageLabel: 'URL Gambar',
      saveBtn: 'Simpan',
      editBtn: 'Edit',
      deleteBtn: 'Hapus',
      cancelBtn: 'Batal',
      noCategories: 'Tidak ada kategori ditemukan.',
      confirmDelete: 'Apakah Anda yakin ingin menghapus kategori ini?',
    },
    adminBlogs: {
      title: 'Manajemen Blog Update',
      subtitle: 'Kelola artikel dan video update.',
      createNew: 'Buat Post Baru',
      searchPlaceholder: 'Cari blog...',
      thTitle: 'JUDUL',
      thType: 'TIPE',
      thDate: 'TANGGAL',
      thStatus: 'STATUS',
      thAction: 'AKSI',
      edit: 'Edit',
      delete: 'Hapus',
      publish: 'Terbitkan',
      unpublish: 'Batalkan Terbit',
      noBlogs: 'Tidak ada blog ditemukan.',
      typeArticle: 'Artikel',
      typeVideo: 'Video',
      blogTitle: 'Judul Blog',
      blogSlug: 'Slug',
      blogExcerpt: 'Ringkasan',
      blogContent: 'Konten',
      blogImage: 'URL Gambar',
      blogVideoUrl: 'URL Video',
      saveDraft: 'Simpan Draf',
      publishBtn: 'Terbitkan',
    },
    adminBanners: {
      title: 'Manajemen Banner',
      subtitle: 'Kelola banner promosi toko.',
      addNew: 'Tambah Banner Baru',
      thImage: 'GAMBAR',
      thTitle: 'JUDUL',
      thLink: 'LINK',
      thStatus: 'STATUS',
      thAction: 'AKSI',
      edit: 'Edit',
      delete: 'Hapus',
      noBanners: 'Tidak ada banner ditemukan.',
      bannerTitle: 'Judul Banner',
      bannerSubtitle: 'Subjudul',
      bannerLink: 'URL Link Produk',
      bannerImage: 'URL Gambar',
      saveBtn: 'Simpan Banner',
    },
    adminVouchers: {
      title: 'Manajemen Voucher Promo',
      subtitle: 'Kelola voucher diskon untuk pelanggan.',
      addNew: 'Tambah Voucher Baru',
      thCode: 'KODE',
      thTitle: 'JUDUL',
      thDiscount: 'DISKON',
      thMinSpend: 'MIN. BELANJA',
      thStatus: 'STATUS',
      thAction: 'AKSI',
      edit: 'Edit',
      delete: 'Hapus',
      noVouchers: 'Tidak ada voucher ditemukan.',
      voucherCode: 'Kode Voucher',
      voucherTitle: 'Judul Voucher',
      discountType: 'Tipe Diskon',
      discountValue: 'Nilai Diskon',
      minSpend: 'Min. Belanja (RM)',
      statusActive: 'Aktif',
      statusInactive: 'Tidak Aktif',
      saveBtn: 'Simpan Voucher',
    },
    adminCustomers: {
      title: 'Database Pelanggan',
      subtitle: 'Lihat dan kelola semua pelanggan terdaftar.',
      searchPlaceholder: 'Cari pelanggan...',
      filterAll: 'Semua',
      filterRetail: 'Retail',
      filterWholesale: 'Grosir',
      thName: 'NAMA',
      thEmail: 'EMAIL',
      thPhone: 'TELEPON',
      thType: 'TIPE',
      thOrders: 'PESANAN',
      thSpent: 'BELANJA',
      thJoined: 'TANGGAL DAFTAR',
      noCustomers: 'Tidak ada pelanggan ditemukan.',
    },
    adminRecipes: {
      title: 'CMS Pusat Resep',
      subtitle: 'Kelola resep bakery dan panduan masak.',
      addNew: 'Tambah Resep Baru',
      thTitle: 'JUDUL',
      thCategory: 'KATEGORI',
      thDifficulty: 'KESULITAN',
      thStatus: 'STATUS',
      thAction: 'AKSI',
      edit: 'Edit',
      delete: 'Hapus',
      noRecipes: 'Tidak ada resep ditemukan.',
    },
    adminSettings: {
      title: 'Pengaturan Toko & WhatsApp',
      subtitle: 'Konfigurasi informasi toko dan kredensial admin.',
      storeInfo: 'Informasi Toko',
      storeName: 'Nama Toko',
      storeDesc: 'Deskripsi Toko',
      whatsappNumber: 'Nomor WhatsApp',
      adminCredentials: 'Kredensial Admin',
      adminEmail: 'Email Admin',
      adminPassword: 'Kata Sandi Admin',
      saveSettings: 'Simpan Pengaturan',
      saving: 'Menyimpan...',
      saved: 'Tersimpan!',
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
      reset: 'Reset Filter',
      productsCount: 'Produk Ditemukan',
      noResults: 'Tidak ada produk ditemukan',
      loading: 'Memuat...',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit',
      create: 'Buat',
      update: 'Perbarui',
      search: 'Cari',
      filter: 'Filter',
      actions: 'Aksi',
      view: 'Lihat',
      detail: 'Detail',
      upload: 'Unggah',
      download: 'Unduh',
      export: 'Ekspor',
      import: 'Impor',
      print: 'Cetak',
      publish: 'Terbitkan',
      unpublish: 'Batalkan Terbit',
      approve: 'Setujui',
      reject: 'Tolak',
      back: 'Kembali',
      next: 'Berikutnya',
      previous: 'Sebelumnya',
      close: 'Tutup',
      confirm: 'Konfirmasi',
      yes: 'Ya',
      no: 'Tidak',
      or: 'atau',
      and: 'dan',
      all: 'Semua',
      none: 'Tidak ada',
      required: 'Wajib',
      optional: 'Opsional',
    },
    trustBadges: {
      b1Title: '100% Sertifikat Halal',
      b1Desc: 'Sertifikasi Halal resmi Malaysia & Indonesia',
      b2Title: 'Impor Grade Premium',
      b2Desc: 'Langsung dari Italia, Belgia & New Zealand',
      b3Title: 'Pengiriman Cepat Express',
      b3Desc: 'Kirim hari ini ke seluruh MY & ID',
      b4Title: 'Diskon Grosir Baker',
      b4Desc: 'Harga khusus kemasan karung 5kg & 25kg',
    },
    adminCashflow: {
      title: 'Laporan Arus Kas (Cashflow Ledger)',
      subtitle: 'Modul keuangan khusus untuk mencatat kas masuk (omset penjualan), kas keluar (HPP & operasional), laba bersih, serta neraca keuangan real-time.',
      addExpenseBtn: 'Catat Pengeluaran Kas Baru',
      card1Label: '1. KAS MASUK (INFLOW)',
      card1Sub: 'Grafik Penjualan Harian',
      card2Label: '2. KAS KELUAR (OUTFLOW)',
      card2Sub: 'Grafik Breakdown Kategori',
      card3Label: '3. LABA BERSIH (NET)',
      card3Sub: 'Grafik Komparasi Masuk vs Keluar',
      card4Label: '4. MARGIN PROFIT (%)',
      card4Sub: 'Grafik Target & Efisiensi',
      journalTitle: 'Jurnal Transaksi Arus Kas',
      filterLabel: 'Filter Kategori:',
      filterAll: 'Semua Kategori',
      thDate: 'TANGGAL',
      thType: 'JENIS KAS',
      thCategory: 'KATEGORI',
      thDesc: 'KETERANGAN TRANSAKSI',
      thAmount: 'JUMLAH (MYR)',
      thAction: 'AKSI',
      inflowTag: 'KAS MASUK',
      outflowTag: 'KAS KELUAR',
    },
    customerAccount: {
      loginTitle: 'Masuk ke Akun Anda',
      loginSubtitle: 'Masukkan detail Anda untuk mengakses akun pelanggan.',
      registerTitle: 'Daftar Akun Baru',
      registerSubtitle: 'Buat akun untuk menikmati pengalaman belanja yang lebih mudah.',
      forgotTitle: 'Lupa Kata Sandi',
      forgotSubtitle: 'Masukkan telepon/email untuk mereset kata sandi Anda.',
      dashboardTitle: 'Dashboard Akun Saya',
      dashboardSubtitle: 'Kelola profil, pesanan, dan wishlist Anda.',
      phoneOrEmail: 'Telepon / Email',
      password: 'Kata Sandi',
      confirmPassword: 'Konfirmasi Kata Sandi',
      fullName: 'Nama Lengkap',
      phoneNumber: 'Nomor Telepon',
      emailAddress: 'Alamat Email',
      loginBtn: 'Masuk',
      registerBtn: 'Daftar Sekarang',
      resetBtn: 'Reset Kata Sandi',
      loggingIn: 'Mengautentikasi...',
      registering: 'Mendaftar...',
      noAccount: 'Belum punya akun?',
      hasAccount: 'Sudah punya akun?',
      forgotPassword: 'Lupa kata sandi?',
      orContinueWith: 'atau lanjutkan dengan',
      rememberMe: 'Ingat saya',
      logoutBtn: 'Keluar',
      profileTitle: 'Profil Saya',
      orderHistory: 'Riwayat Pesanan',
      wishlistTitle: 'Daftar Keinginan',
      addressBook: 'Buku Alamat',
      editProfile: 'Edit Profil',
      saveProfile: 'Simpan Profil',
      address: 'Alamat',
      city: 'Kota',
      state: 'Negara Bagian',
      postcode: 'Kode Pos',
      wrongCredentials: 'Telepon/email atau kata sandi salah.',
      emailExists: 'Email ini sudah terdaftar.',
      phoneExists: 'Nomor telepon ini sudah terdaftar.',
      passwordMismatch: 'Kata sandi tidak cocok.',
      passwordMinLength: 'Kata sandi minimal 6 karakter.',
      verifyIdentity: 'Verifikasi Identitas',
      enterOtp: 'Masukkan OTP',
      securityCheck: 'Pemeriksaan Keamanan',
      showPassword: 'Tampilkan kata sandi',
      hidePassword: 'Sembunyikan kata sandi',
      rateLimitWarning: 'Terlalu banyak percobaan. Silakan tunggu sebentar.',
      accountLocked: 'Akun terkunci sementara. Silakan coba lagi setelah',
      returnToStore: '← Kembali ke Toko',
    },
    faq: {
      title: 'Pertanyaan yang Sering Diajukan (FAQ)',
      subtitle: 'Jawaban untuk pertanyaan yang sering ditanyakan tentang produk dan layanan kami.',
      searchPlaceholder: 'Cari pertanyaan...',
      noResults: 'Tidak ada pertanyaan yang cocok dengan pencarian Anda.',
      contactUs: 'Hubungi Kami',
      contactNote: 'Tidak menemukan jawaban Anda? Hubungi kami via WhatsApp.',
    },
    status: {
      new: 'Baru',
      processing: 'Diproses',
      shipped: 'Dikirim',
      delivered: 'Diterima',
      cancelled: 'Dibatalkan',
      active: 'Aktif',
      inactive: 'Tidak Aktif',
      draft: 'Draf',
      published: 'Diterbitkan',
      pending: 'Menunggu',
      completed: 'Selesai',
      refunded: 'Dikembalikan',
    },
    adminExtra: {
      liveMetrics: 'TINJAUAN METRIK TOKO LANGSUNG',
      revenueToday: 'PENDAPATAN HARI INI',
      revenueMonth: 'PENDAPATAN BULAN INI',
      today: 'Hari ini',
      thisMonth: 'Bulan Ini',
      bestSeller: 'PRODUK TERLARIS',
      noDataYet: 'Belum Ada Data',
      sold: 'Terjual',
      lowStock: 'STOK MENIPIS',
      products: 'Produk',
      restockRequired: 'Perlu Restok Segera →',
      stockHealthy: 'Stok Aman',
      chartTitle: 'Grafik Analitik Omset & Penjualan Interaktif',
      chartSubtitle: 'Klik titik grafik atau bar mana saja untuk melihat rincian transaksi instan.',
      days7: '7 Hari',
      days30: '30 Hari',
      year1: '1 Tahun',
      calendar: 'Kalender',
      fromDate: 'Dari Tanggal:',
      toDate: 'Sampai Tanggal:',
      chartAutoUpdate: '✓ Grafik otomatis diperbarui sesuai tanggal terpilih',
      totalOmset: 'Total Omset',
      totalOrders: 'Total Pesanan',
      avgOrder: 'Rata-Rata / Pesanan',
      order: 'Pesanan',
      orders: 'Pesanan',
      omsetLabel: 'Omset',
      ordersLabel: 'Pesanan',
      dateLabel: 'Tanggal',
      noDataPeriod: 'Belum ada data di periode ini',
      manageResi: 'Kelola Resi Pesanan →',
      shortcutCategories: 'Kategori',
      shortcutRecipes: 'Resep & Video',
      shortcutBlogs: 'Blog CMS',
      shortcutVouchers: 'Voucher Diskon',
      shortcutCustomers: 'CRM Pelanggan',
      shortcutSettings: 'Pengaturan',
      recentWAOrders: 'Pesanan WhatsApp Terbaru',
      recentWAOrdersSub: 'Daftar transaksi masuk dari katalog produk toko.',
      viewAllOrders: 'Lihat Semua Pesanan',
      thPhotoProduct: 'FOTO & ITEM PRODUK',
      thOrderNumber: 'NO. PESANAN',
      thWACustomer: 'PELANGGAN WHATSAPP',
      thTotalPayment: 'TOTAL PEMBAYARAN',
      thStatusResi: 'STATUS & RESI',
      thAdminAction: 'AKSI ADMIN',
      bakingPackage: 'Paket Bahan Kue',
      variant: 'Varian',
      item: 'Item',
      items: 'Item',
      chatWA: 'Chat WA',
      pendingResi: 'Resi Pending',
      resiNumber: 'Resi',
      processOrder: 'Proses Pesanan',
      viewDetailOrder: 'Lihat Detail',
      stockAlertTitle: 'Peringatan Stok Kritis',
      stockAlertSub: 'produk dengan stok rendah yang memerlukan restok segera.',
      stockRemaining: 'Sisa stok',
      restockNow: 'Restok Sekarang →',
      stockSafe: 'Semua stok dalam keadaan aman!',
      cfFilterTimeRange: 'Filter Rentang Waktu Grafik',
      cfAvgPerPeriod: 'Rata-Rata Per Periode',
      cfPeakHighest: 'Puncak Tertinggi',
      cfStatusPerformance: 'Status Performa',
      cfHealthy: 'Sehat',
      cfWarning: 'Peringatan',
      cfTotalInflow: 'Total Inflow',
      cfTotalOutflow: 'Total Outflow',
      cfNetProfit: 'Laba Bersih',
      cfOrderSales: 'Penjualan Pesanan',
      cfAuto: 'Auto',
      cfReduceNet: 'Kurangi net cashflow secara langsung.',
      cfDateLabel: 'Tanggal',
      cfCategoryLabel: 'Kategori',
      cfDescLabel: 'Deskripsi Transaksi',
      cfAmountLabel: 'Jumlah (MYR)',
      cfCancel: 'Batal',
      cfSave: 'Simpan',
      cfActive: 'Aktif',
      cfCatHPP: 'Pembelian Stok (HPP)',
      cfCatPackaging: 'Biaya Packaging',
      cfCatCourier: 'Biaya Kurir & Logistik',
      cfCatWarehouse: 'Operasional Gudang & Listrik',
      cfCatOther: 'Pengeluaran Lainnya',
      cfNoExpenses: 'Belum ada pengeluaran dicatat.',
      ordersTitle: 'Manajemen Pesanan',
      ordersSubtitle: 'Kelola pesanan WhatsApp pelanggan, verifikasi pembayaran, dan terbitkan nomor resi pengiriman.',
      ordersThPhoto: 'FOTO & PRODUK DIBELI',
      ordersThOrderNo: 'NO. PESANAN',
      ordersThCustomer: 'PELANGGAN WHATSAPP',
      ordersThTotal: 'TOTAL BAYAR',
      ordersThStatus: 'STATUS & RESI',
      ordersThAction: 'AKSI ADMIN',
      ordersResiPending: 'Resi Pending',
      ordersNoOrders: 'Tidak ada pesanan ditemukan.',
      orderNotFound: 'Pesanan Tidak Ditemukan',
      orderBackToList: '← Kembali ke Daftar Pesanan',
      orderCustomerName: 'Nama & Telepon Pelanggan:',
      orderDeliveryAddress: 'Alamat Pengiriman:',
      orderCustomerNote: 'Catatan Pelanggan:',
      orderNoNote: 'Tidak ada catatan',
      orderItemsOrdered: 'Item Dipesan',
      orderItemQty: 'Jml.',
      orderTotal: 'Total Pesanan',
      orderUpdateStatus: 'Perbarui Status',
      orderTrackingNo: 'Nomor Pelacakan / Resi',
      orderTrackingPlaceholder: 'Masukkan nomor resi...',
      orderSaveTracking: 'Simpan',
      orderTimeline: 'Timeline Pesanan',
      orderPrintInvoice: 'Cetak Invoice',
      orderPrintReceipt: 'Cetak Struk',
      orderChatCustomer: 'Chat WhatsApp',
      productsExport: 'Ekspor CSV',
      productsImport: 'Impor CSV',
      productsDeleteConfirm: 'Apakah Anda yakin ingin menghapus produk ini?',
      productsVariants: 'Varian',
      productsSKU: 'SKU',
      productsStock: 'Stok',
      productsPrice: 'Harga',
      videosTitle: 'Manajemen Video',
      videosSubtitle: 'Kelola video tutorial dan promosi.',
      videosAddNew: 'Tambah Video Baru',
      videosThThumbnail: 'THUMBNAIL',
      videosThTitle: 'JUDUL',
      videosThPlatform: 'PLATFORM',
      videosThStatus: 'STATUS',
      videosThAction: 'AKSI',
      videosNoVideos: 'Tidak ada video ditemukan.',
      videosVideoTitle: 'Judul Video',
      videosVideoUrl: 'URL Video',
      videosPlatform: 'Platform',
      videosSaveVideo: 'Simpan Video',
      videosUploadFile: 'Upload File',
      videosUploadMP4: 'Upload MP4 / WebM',
      settingsTabStore: 'Pengaturan Toko',
      settingsTabBackup: 'Backup & Restore',
      settingsTabAudit: 'Audit Log',
      settingsBackupTitle: 'Backup & Restore Data',
      settingsBackupSub: 'Backup atau restore data toko Anda.',
      settingsBackupBtn: 'Download Backup',
      settingsRestoreBtn: 'Restore dari File',
      settingsAuditTitle: 'Audit Log Admin',
      settingsAuditSub: 'Rekam semua aktivitas admin.',
      settingsAuditNoLogs: 'Tidak ada log audit.',
      customersMemberTier: 'MEMBER TIER',
      customersTierRetail: 'Tier: RETAIL',
      customersTierVIP: 'Tier: VIP',
      customersTierWholesale: 'Tier: WHOLESALE B2B',
      blogsUploadMP4: 'Upload MP4 / WebM',
      categoriesUploadFile: 'Upload File',
      uploadFile: 'Upload File',
      confirmDeleteTitle: 'Konfirmasi Hapus',
      confirmDeleteMsg: 'Apakah Anda yakin ingin menghapus item ini?',
      noData: 'Tidak ada data',
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
      blog: 'Updates Blog',
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
      heading: 'Malaysia\'s Premier Bakery & Pastry Supply World',
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
      emptyTitle: 'Your cart is empty',
      emptySubtitle: 'Explore our semolina flour, matcha powder, Belgian chocolate, and premium butter.',
      subtotal: 'Product Subtotal',
      estimatedTotal: 'Estimated Total',
      proceedCheckout: 'Proceed to WhatsApp Checkout',
      clearCart: 'Clear Entire Cart',
      continueShopping: 'Continue Shopping',
      addMore: 'Add More Products to Order',
      orderSummary: 'Order Summary',
      totalItems: 'Total Items',
      items: 'Items',
      deliveryFee: 'Delivery Fee',
      confirmedViaWA: 'Confirmed via WhatsApp',
      paymentNote: 'Payment & shipping costs are confirmed directly with our admin via WhatsApp after order submission.',
      freeShippingAdd: 'Add more for FREE SHIPPING',
      freeShippingUnlocked: '🎉 Free Delivery unlocked across Malaysia!',
      variant: 'Variant',
      sku: 'SKU',
      removeItem: 'Remove item',
    },
    checkout: {
      title: 'WhatsApp Checkout',
      subtitle: 'Enter your delivery details and apply promo vouchers to generate your WhatsApp order message.',
      contactHeader: '1. Customer Contact Details',
      addressHeader: '2. Delivery Address (Malaysia)',
      notesHeader: '3. Additional Notes (Optional)',
      submitBtn: 'SUBMIT & CHECKOUT VIA WHATSAPP',
      submitting: 'Generating Order...',
      voucherLabel: 'Apply Promo Voucher Code',
      voucherApplyBtn: 'Apply',
      voucherPlaceholder: 'e.g. VIPBAKER20',
      voucherApplied: 'Voucher Applied',
      voucherNotFound: 'Voucher code not found or inactive.',
      voucherMinSpend: 'Minimum spend for this voucher is RM',
      fullName: 'Full Name',
      phoneNumber: 'WhatsApp Phone Number',
      streetAddress: 'Street Address / Unit / Building',
      city: 'City / Town',
      postcode: 'Postcode',
      state: 'State',
      notesPlaceholder: 'e.g. Urgent delivery required, please pack in extra bubble wrap.',
      namePlaceholder: 'e.g. Ahmad Naufal',
      phonePlaceholder: 'e.g. +60123456789',
      addressPlaceholder: 'e.g. No 45, Jalan Bunga Raya 7/2, Section 7',
      orderItems: 'Order Items',
      subtotalProduk: 'Product Subtotal',
      discountVoucher: 'Voucher Discount',
      finalTotal: 'Final Total',
      formNote: 'Submitting this form creates your Order ID and opens a pre-formatted message directly to our WhatsApp support line.',
      emptyCart: 'Your cart is empty',
      emptyCartNote: 'Please add baking products to your cart before proceeding to checkout.',
      browseCatalog: 'Browse Catalog',
      autoFillNote: '⚡ Shipping Address Auto-filled: Address data taken from your account profile.',
      changeAddress: 'Change Account Address',
      orderSuccess: 'Order Registered Successfully',
      orderRegistered: 'Order',
      thankYou: 'Thank you! Your order has been saved in our system and redirected to WhatsApp Admin.',
      orderStatus: 'Order Status',
      totalAmount: 'Total Amount',
      phone: 'Phone',
      deliveryAddress: 'Delivery Address',
      openWAAgain: 'Open WhatsApp Again',
      trackOrderStatus: 'Track Order Status',
      errorCreating: 'Error creating order. Please try again.',
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
      cashflow: 'Cashflow Report',
    },
    adminLogin: {
      title: 'Admin Portal Login',
      subtitle: 'Enter your credentials to access store management dashboard.',
      usernameLabel: 'Username / Email',
      passwordLabel: 'Password',
      signInBtn: 'Sign In To Dashboard',
      authenticating: 'Authenticating...',
      returnToStore: '← Return to Main Store Website',
      activeCreds: 'Active Admin Credentials:',
      wrongCreds: 'Username or password is incorrect.',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    },
    adminDashboard: {
      welcome: 'Welcome to Dashboard',
      subtitle: 'Overview of your business performance.',
      totalRevenue: 'Total Revenue',
      totalOrders: 'Total Orders',
      totalProducts: 'Total Products',
      totalCustomers: 'Total Customers',
      revenueChart: 'Revenue Chart',
      recentOrders: 'Recent Orders',
      topProducts: 'Top Products',
      orderNumber: 'Order No.',
      customer: 'Customer',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      viewAll: 'View All',
      period7d: '7 Days',
      period30d: '30 Days',
      period90d: '90 Days',
      periodCustom: 'Custom',
      from: 'From',
      to: 'To',
    },
    adminOrders: {
      title: 'Order Management',
      subtitle: 'Manage all customer orders from one place.',
      searchPlaceholder: 'Search orders...',
      filterAll: 'All',
      filterNew: 'New',
      filterProcessing: 'Processing',
      filterShipped: 'Shipped',
      filterDelivered: 'Delivered',
      filterCancelled: 'Cancelled',
      thOrder: 'ORDER',
      thCustomer: 'CUSTOMER',
      thItems: 'ITEMS',
      thTotal: 'TOTAL',
      thStatus: 'STATUS',
      thDate: 'DATE',
      thAction: 'ACTION',
      noOrders: 'No orders found.',
      viewDetail: 'View Detail',
      updateStatus: 'Update Status',
      orderDetail: 'Order Detail',
      backToOrders: '← Back to Orders List',
      customerInfo: 'Customer Information',
      orderItems: 'Order Items',
      shippingAddress: 'Shipping Address',
      notes: 'Notes',
      timeline: 'Timeline',
    },
    adminProducts: {
      title: 'Product Catalog Management',
      subtitle: 'Manage all your bakery ingredient products.',
      addNew: 'Add New Product',
      searchPlaceholder: 'Search products...',
      thImage: 'IMAGE',
      thName: 'PRODUCT NAME',
      thCategory: 'CATEGORY',
      thPrice: 'PRICE',
      thStock: 'STOCK',
      thStatus: 'STATUS',
      thAction: 'ACTION',
      edit: 'Edit',
      delete: 'Delete',
      noProducts: 'No products found.',
      active: 'Active',
      draft: 'Draft',
      newProduct: 'New Product',
      editProduct: 'Edit Product',
      productName: 'Product Name',
      productSlug: 'Product Slug',
      productDesc: 'Product Description',
      productCategory: 'Product Category',
      productImage: 'Product Image',
      productVariants: 'Product Variants',
      saveProduct: 'Save Product',
      saving: 'Saving...',
    },
    adminCategories: {
      title: 'Category Management',
      subtitle: 'Manage bakery ingredient categories.',
      addNew: 'Add New Category',
      nameLabel: 'Category Name',
      slugLabel: 'Slug',
      descLabel: 'Description',
      imageLabel: 'Image URL',
      saveBtn: 'Save',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      cancelBtn: 'Cancel',
      noCategories: 'No categories found.',
      confirmDelete: 'Are you sure you want to delete this category?',
    },
    adminBlogs: {
      title: 'Updates Blog Management',
      subtitle: 'Manage articles and video updates.',
      createNew: 'Create New Post',
      searchPlaceholder: 'Search blogs...',
      thTitle: 'TITLE',
      thType: 'TYPE',
      thDate: 'DATE',
      thStatus: 'STATUS',
      thAction: 'ACTION',
      edit: 'Edit',
      delete: 'Delete',
      publish: 'Publish',
      unpublish: 'Unpublish',
      noBlogs: 'No blogs found.',
      typeArticle: 'Article',
      typeVideo: 'Video',
      blogTitle: 'Blog Title',
      blogSlug: 'Slug',
      blogExcerpt: 'Excerpt',
      blogContent: 'Content',
      blogImage: 'Image URL',
      blogVideoUrl: 'Video URL',
      saveDraft: 'Save Draft',
      publishBtn: 'Publish',
    },
    adminBanners: {
      title: 'Banner Management',
      subtitle: 'Manage store promotional banners.',
      addNew: 'Add New Banner',
      thImage: 'IMAGE',
      thTitle: 'TITLE',
      thLink: 'LINK',
      thStatus: 'STATUS',
      thAction: 'ACTION',
      edit: 'Edit',
      delete: 'Delete',
      noBanners: 'No banners found.',
      bannerTitle: 'Banner Title',
      bannerSubtitle: 'Subtitle',
      bannerLink: 'Product Link URL',
      bannerImage: 'Image URL',
      saveBtn: 'Save Banner',
    },
    adminVouchers: {
      title: 'Promo Voucher Management',
      subtitle: 'Manage discount vouchers for customers.',
      addNew: 'Add New Voucher',
      thCode: 'CODE',
      thTitle: 'TITLE',
      thDiscount: 'DISCOUNT',
      thMinSpend: 'MIN. SPEND',
      thStatus: 'STATUS',
      thAction: 'ACTION',
      edit: 'Edit',
      delete: 'Delete',
      noVouchers: 'No vouchers found.',
      voucherCode: 'Voucher Code',
      voucherTitle: 'Voucher Title',
      discountType: 'Discount Type',
      discountValue: 'Discount Value',
      minSpend: 'Min. Spend (RM)',
      statusActive: 'Active',
      statusInactive: 'Inactive',
      saveBtn: 'Save Voucher',
    },
    adminCustomers: {
      title: 'Customer Database',
      subtitle: 'View and manage all registered customers.',
      searchPlaceholder: 'Search customers...',
      filterAll: 'All',
      filterRetail: 'Retail',
      filterWholesale: 'Wholesale',
      thName: 'NAME',
      thEmail: 'EMAIL',
      thPhone: 'PHONE',
      thType: 'TYPE',
      thOrders: 'ORDERS',
      thSpent: 'SPENT',
      thJoined: 'JOINED',
      noCustomers: 'No customers found.',
    },
    adminRecipes: {
      title: 'Recipe Center CMS',
      subtitle: 'Manage bakery recipes and cooking guides.',
      addNew: 'Add New Recipe',
      thTitle: 'TITLE',
      thCategory: 'CATEGORY',
      thDifficulty: 'DIFFICULTY',
      thStatus: 'STATUS',
      thAction: 'ACTION',
      edit: 'Edit',
      delete: 'Delete',
      noRecipes: 'No recipes found.',
    },
    adminSettings: {
      title: 'Store & WhatsApp Settings',
      subtitle: 'Configure store information and admin credentials.',
      storeInfo: 'Store Information',
      storeName: 'Store Name',
      storeDesc: 'Store Description',
      whatsappNumber: 'WhatsApp Number',
      adminCredentials: 'Admin Credentials',
      adminEmail: 'Admin Email',
      adminPassword: 'Admin Password',
      saveSettings: 'Save Settings',
      saving: 'Saving...',
      saved: 'Saved!',
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
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      update: 'Update',
      search: 'Search',
      filter: 'Filter',
      actions: 'Actions',
      view: 'View',
      detail: 'Detail',
      upload: 'Upload',
      download: 'Download',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      publish: 'Publish',
      unpublish: 'Unpublish',
      approve: 'Approve',
      reject: 'Reject',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      all: 'All',
      none: 'None',
      required: 'Required',
      optional: 'Optional',
    },
    trustBadges: {
      b1Title: '100% Halal Certified',
      b1Desc: 'Official Halal certification for MY & ID',
      b2Title: 'Premium Imported Grade',
      b2Desc: 'Direct from Italy, Belgium & New Zealand',
      b3Title: 'Express Fast Delivery',
      b3Desc: 'Dispatched today across MY & ID',
      b4Title: 'Baker Wholesale Discount',
      b4Desc: 'Special rates for 5kg & 25kg bulk sacks',
    },
    adminCashflow: {
      title: 'Cashflow Statement & Ledger',
      subtitle: 'Financial statement module tracking cash inflow (sales revenue), cash outflow (COGS & operations), net profit, and real-time ledger.',
      addExpenseBtn: 'Record New Cash Expense',
      card1Label: '1. CASH INFLOW',
      card1Sub: 'Daily Sales Chart',
      card2Label: '2. CASH OUTFLOW',
      card2Sub: 'Category Breakdown Chart',
      card3Label: '3. NET PROFIT',
      card3Sub: 'Inflow vs Outflow Comparison',
      card4Label: '4. PROFIT MARGIN (%)',
      card4Sub: 'Target & Efficiency Meter',
      journalTitle: 'Cashflow Ledger Journal',
      filterLabel: 'Filter Category:',
      filterAll: 'All Categories',
      thDate: 'DATE',
      thType: 'CASH TYPE',
      thCategory: 'CATEGORY',
      thDesc: 'TRANSACTION DESCRIPTION',
      thAmount: 'AMOUNT (MYR)',
      thAction: 'ACTION',
      inflowTag: 'CASH INFLOW',
      outflowTag: 'CASH OUTFLOW',
    },
    customerAccount: {
      loginTitle: 'Sign In to Your Account',
      loginSubtitle: 'Enter your details to access your customer account.',
      registerTitle: 'Create New Account',
      registerSubtitle: 'Create an account to enjoy a better shopping experience.',
      forgotTitle: 'Forgot Password',
      forgotSubtitle: 'Enter your phone/email to reset your password.',
      dashboardTitle: 'My Account Dashboard',
      dashboardSubtitle: 'Manage your profile, orders, and wishlist.',
      phoneOrEmail: 'Phone / Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      loginBtn: 'Sign In',
      registerBtn: 'Register Now',
      resetBtn: 'Reset Password',
      loggingIn: 'Authenticating...',
      registering: 'Registering...',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      forgotPassword: 'Forgot password?',
      orContinueWith: 'or continue with',
      rememberMe: 'Remember me',
      logoutBtn: 'Log Out',
      profileTitle: 'My Profile',
      orderHistory: 'Order History',
      wishlistTitle: 'Wishlist',
      addressBook: 'Address Book',
      editProfile: 'Edit Profile',
      saveProfile: 'Save Profile',
      address: 'Address',
      city: 'City',
      state: 'State',
      postcode: 'Postcode',
      wrongCredentials: 'Phone/email or password is incorrect.',
      emailExists: 'This email is already registered.',
      phoneExists: 'This phone number is already registered.',
      passwordMismatch: 'Passwords do not match.',
      passwordMinLength: 'Password must be at least 6 characters.',
      verifyIdentity: 'Verify Identity',
      enterOtp: 'Enter OTP',
      securityCheck: 'Security Check',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      rateLimitWarning: 'Too many attempts. Please wait a moment.',
      accountLocked: 'Account temporarily locked. Please try again after',
      returnToStore: '← Back to Store',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Answers to commonly asked questions about our products and services.',
      searchPlaceholder: 'Search questions...',
      noResults: 'No questions found matching your search.',
      contactUs: 'Contact Us',
      contactNote: 'Can\'t find your answer? Contact us via WhatsApp.',
    },
    status: {
      new: 'New',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      active: 'Active',
      inactive: 'Inactive',
      draft: 'Draft',
      published: 'Published',
      pending: 'Pending',
      completed: 'Completed',
      refunded: 'Refunded',
    },
    adminExtra: {
      liveMetrics: 'LIVE STORE METRICS OVERVIEW',
      revenueToday: 'TODAY REVENUE',
      revenueMonth: 'THIS MONTH REVENUE',
      today: 'Today',
      thisMonth: 'This Month',
      bestSeller: 'BEST SELLER',
      noDataYet: 'No Data Yet',
      sold: 'Sold',
      lowStock: 'LOW STOCK',
      products: 'Products',
      restockRequired: 'Restock Required →',
      stockHealthy: 'Stock Healthy',
      chartTitle: 'Interactive Sales & Revenue Analytics Chart',
      chartSubtitle: 'Click any chart point or bar to view instant transaction details.',
      days7: '7 Days',
      days30: '30 Days',
      year1: '1 Year',
      calendar: 'Calendar',
      fromDate: 'From Date:',
      toDate: 'To Date:',
      chartAutoUpdate: '✓ Chart auto-updated based on selected dates',
      totalOmset: 'Total Revenue',
      totalOrders: 'Total Orders',
      avgOrder: 'Avg / Order',
      order: 'Order',
      orders: 'Orders',
      omsetLabel: 'Revenue',
      ordersLabel: 'Orders',
      dateLabel: 'Date',
      noDataPeriod: 'No data in this period',
      manageResi: 'Manage Order Tracking →',
      shortcutCategories: 'Categories',
      shortcutRecipes: 'Recipes & Videos',
      shortcutBlogs: 'Blog CMS',
      shortcutVouchers: 'Discount Vouchers',
      shortcutCustomers: 'Customer CRM',
      shortcutSettings: 'Settings',
      recentWAOrders: 'Recent WhatsApp Orders',
      recentWAOrdersSub: 'Latest incoming transactions from the store product catalog.',
      viewAllOrders: 'View All Orders',
      thPhotoProduct: 'PHOTO & PRODUCT ITEM',
      thOrderNumber: 'ORDER NO.',
      thWACustomer: 'WHATSAPP CUSTOMER',
      thTotalPayment: 'TOTAL PAYMENT',
      thStatusResi: 'STATUS & TRACKING',
      thAdminAction: 'ADMIN ACTION',
      bakingPackage: 'Baking Package',
      variant: 'Variant',
      item: 'Item',
      items: 'Items',
      chatWA: 'Chat WA',
      pendingResi: 'Tracking Pending',
      resiNumber: 'Tracking',
      processOrder: 'Process Order',
      viewDetailOrder: 'View Detail',
      stockAlertTitle: 'Critical Stock Alert',
      stockAlertSub: 'products with low stock requiring immediate restock.',
      stockRemaining: 'Stock remaining',
      restockNow: 'Restock Now →',
      stockSafe: 'All stock levels are healthy!',
      cfFilterTimeRange: 'Filter Chart Time Range',
      cfAvgPerPeriod: 'Average Per Period',
      cfPeakHighest: 'Peak Highest',
      cfStatusPerformance: 'Performance Status',
      cfHealthy: 'Healthy',
      cfWarning: 'Warning',
      cfTotalInflow: 'Total Inflow',
      cfTotalOutflow: 'Total Outflow',
      cfNetProfit: 'Net Profit',
      cfOrderSales: 'Order Sales',
      cfAuto: 'Auto',
      cfReduceNet: 'Reduces net cashflow directly.',
      cfDateLabel: 'Date',
      cfCategoryLabel: 'Category',
      cfDescLabel: 'Transaction Description',
      cfAmountLabel: 'Amount (MYR)',
      cfCancel: 'Cancel',
      cfSave: 'Save',
      cfActive: 'Active',
      cfCatHPP: 'Stock Purchase (COGS)',
      cfCatPackaging: 'Packaging Cost',
      cfCatCourier: 'Courier & Logistics',
      cfCatWarehouse: 'Warehouse & Electricity',
      cfCatOther: 'Other Expenses',
      cfNoExpenses: 'No expenses recorded.',
      ordersTitle: 'Order Management',
      ordersSubtitle: 'Manage customer WhatsApp orders, verify payments, and issue courier tracking numbers.',
      ordersThPhoto: 'PHOTO & PRODUCT PURCHASED',
      ordersThOrderNo: 'ORDER NO.',
      ordersThCustomer: 'WHATSAPP CUSTOMER',
      ordersThTotal: 'TOTAL PAYMENT',
      ordersThStatus: 'STATUS & TRACKING',
      ordersThAction: 'ADMIN ACTION',
      ordersResiPending: 'Tracking Pending',
      ordersNoOrders: 'No orders found.',
      orderNotFound: 'Order Not Found',
      orderBackToList: '← Back to Orders List',
      orderCustomerName: 'Customer Name & Phone:',
      orderDeliveryAddress: 'Delivery Address:',
      orderCustomerNote: 'Customer Note:',
      orderNoNote: 'No notes',
      orderItemsOrdered: 'Items Ordered',
      orderItemQty: 'Qty.',
      orderTotal: 'Order Total',
      orderUpdateStatus: 'Update Status',
      orderTrackingNo: 'Tracking / Resi Number',
      orderTrackingPlaceholder: 'Enter tracking number...',
      orderSaveTracking: 'Save',
      orderTimeline: 'Order Timeline',
      orderPrintInvoice: 'Print Invoice',
      orderPrintReceipt: 'Print Receipt',
      orderChatCustomer: 'Chat WhatsApp',
      productsExport: 'Export CSV',
      productsImport: 'Import CSV',
      productsDeleteConfirm: 'Are you sure you want to delete this product?',
      productsVariants: 'Variants',
      productsSKU: 'SKU',
      productsStock: 'Stock',
      productsPrice: 'Price',
      videosTitle: 'Video Management',
      videosSubtitle: 'Manage tutorial and promotional videos.',
      videosAddNew: 'Add New Video',
      videosThThumbnail: 'THUMBNAIL',
      videosThTitle: 'TITLE',
      videosThPlatform: 'PLATFORM',
      videosThStatus: 'STATUS',
      videosThAction: 'ACTION',
      videosNoVideos: 'No videos found.',
      videosVideoTitle: 'Video Title',
      videosVideoUrl: 'Video URL',
      videosPlatform: 'Platform',
      videosSaveVideo: 'Save Video',
      videosUploadFile: 'Upload File',
      videosUploadMP4: 'Upload MP4 / WebM',
      settingsTabStore: 'Store Settings',
      settingsTabBackup: 'Backup & Restore',
      settingsTabAudit: 'Audit Log',
      settingsBackupTitle: 'Backup & Restore Data',
      settingsBackupSub: 'Backup or restore your store data.',
      settingsBackupBtn: 'Download Backup',
      settingsRestoreBtn: 'Restore from File',
      settingsAuditTitle: 'Admin Audit Log',
      settingsAuditSub: 'Record of all admin activities.',
      settingsAuditNoLogs: 'No audit logs.',
      customersMemberTier: 'MEMBER TIER',
      customersTierRetail: 'Tier: RETAIL',
      customersTierVIP: 'Tier: VIP',
      customersTierWholesale: 'Tier: WHOLESALE B2B',
      blogsUploadMP4: 'Upload MP4 / WebM',
      categoriesUploadFile: 'Upload File',
      uploadFile: 'Upload File',
      confirmDeleteTitle: 'Confirm Delete',
      confirmDeleteMsg: 'Are you sure you want to delete this item?',
      noData: 'No data',
    },
  },
  ZH: {
    flag: '🇨🇳',
    label: '简体中文',
    shortLabel: 'ZH',
    nav: {
      home: '首页',
      products: '产品目录',
      categories: '原料分类',
      recipes: '食谱与技巧',
      blog: '最新博客',
      about: '关于我们',
      contact: '联系我们',
      trackOrder: '订单追踪',
      cart: '购物车',
      signIn: '登录',
      account: '我的账户',
    },
    searchPlaceholder: '搜索半粗面粉、抹茶、黄油...',
    hero: {
      tagline: '清真认证高级烘焙原料供应商',
      heading: '马来西亚最顶级的烘焙与糕点原料',
      subheading: '提供进口半粗面粉、京都宇治抹茶粉、比利时巧克力与新西兰安佳黄油，直达您的烘焙厨房。',
      primaryBtn: '浏览所有产品',
      secondaryBtn: '追踪包裹',
    },
    sections: {
      featuredTitle: '精选原料分类',
      featuredSubtitle: '为家庭烘焙师与咖啡馆精心挑选的高质量糕点原料。',
      bestsellerTitle: '每周热销榜',
      bestsellerSubtitle: '深受烘焙师与糕点主厨喜爱的明星产品。',
      wholesalerBannerTitle: '咖啡馆与烘焙坊批发优惠',
      wholesalerBannerSubtitle: '购买 5kg 与 25kg 大包装享受专属折扣与配送服务。',
    },
    productDetail: {
      pricePerPack: '每包价格',
      selectVariant: '选择包装规格 / 重量：',
      quantity: '数量：',
      addToCart: '加入购物车',
      orderWhatsApp: '通过 WhatsApp 下单',
      halalCertified: '100% 清真认证',
      fastDelivery: '全马快速送达',
      descriptionTitle: '详细规格与使用指南',
      relatedTitle: '您可能也需要的其他产品',
    },
    cart: {
      title: '您的购物车',
      subtitle: '在通过 WhatsApp 结账之前核对您的烘焙原料。',
      emptyTitle: '您的购物车是空的',
      emptySubtitle: '探索我们的面粉、抹茶粉、比利时巧克力与优质黄油。',
      subtotal: '产品小计',
      estimatedTotal: '预计总额',
      proceedCheckout: '前往 WhatsApp 结账',
      clearCart: '清空购物车',
      continueShopping: '继续购物',
      addMore: '添加更多产品',
      orderSummary: '订单摘要',
      totalItems: '总件数',
      items: '件',
      deliveryFee: '运费',
      confirmedViaWA: '通过 WhatsApp 确认',
      paymentNote: '付款与运费将在下单后由我们的客服通过 WhatsApp 直接确认。',
      freeShippingAdd: '再消费即可享受包邮',
      freeShippingUnlocked: '🎉 已解锁全马免费送货！',
      variant: '规格',
      sku: 'SKU',
      removeItem: '移除商品',
    },
    checkout: {
      title: '通过 WhatsApp 结账',
      subtitle: '输入您的送货信息并使用优惠券以生成您的 WhatsApp 订单消息。',
      contactHeader: '1. 客户联系信息',
      addressHeader: '2. 配送地址（马来西亚）',
      notesHeader: '3. 额外备注（可选）',
      submitBtn: '提交并通过 WHATSAPP 结账',
      submitting: '正在生成订单...',
      voucherLabel: '使用优惠券代码',
      voucherApplyBtn: '使用',
      voucherPlaceholder: '例如：VIPBAKER20',
      voucherApplied: '已应用优惠券',
      voucherNotFound: '优惠券代码无效或已过期。',
      voucherMinSpend: '此优惠券最低消费为 RM',
      fullName: '全名',
      phoneNumber: 'WhatsApp 电话号码',
      streetAddress: '详细街道地址 / 门牌',
      city: '城市',
      postcode: '邮政编码',
      state: '州属',
      notesPlaceholder: '例如：需要加急配送，请使用气泡膜额外包装。',
      namePlaceholder: '例如：张小明',
      phonePlaceholder: '例如：+60123456789',
      addressPlaceholder: '例如：No 45, Jalan Bunga Raya 7/2',
      orderItems: '订购商品',
      subtotalProduk: '商品小计',
      discountVoucher: '优惠券折扣',
      finalTotal: '最终总计',
      formNote: '提交此表单将生成您的订单 ID 并打开预先格式化的 WhatsApp 消息。',
      emptyCart: '您的购物车是空的',
      emptyCartNote: '请在前往结账前将烘焙产品添加到购物车。',
      browseCatalog: '浏览目录',
      autoFillNote: '⚡ 自动填充送货地址：数据取自您的账户资料。',
      changeAddress: '更改账户地址',
      orderSuccess: '订单已成功注册',
      orderRegistered: '订单',
      thankYou: '谢谢！您的订单已保存并转接到 WhatsApp 管理员。',
      orderStatus: '订单状态',
      totalAmount: '总金额',
      phone: '电话',
      deliveryAddress: '送货地址',
      openWAAgain: '再次打开 WhatsApp',
      trackOrderStatus: '追踪订单状态',
      errorCreating: '创建订单出错，请重试。',
    },
    adminNav: {
      title: 'FBS BAKERY WORLD • CMS 管理门户',
      dashboard: '控制面板',
      orders: '订单管理',
      products: '产品管理',
      categories: '分类管理',
      recipes: '食谱管理',
      blogs: '博客文章',
      banners: '横幅设置',
      vouchers: '优惠券',
      customers: '客户 CRM',
      settings: '店铺设置',
      openStore: '前往前台',
      signOut: '退出登录',
      cashflow: '财务流水',
    },
    adminLogin: {
      title: '管理员登录',
      subtitle: '输入凭据以访问后台管理系统',
      usernameLabel: '用户名 / 邮箱',
      passwordLabel: '密码',
      signInBtn: '登录',
      authenticating: '验证中...',
      returnToStore: '返回主页',
      activeCreds: '默认凭据',
      wrongCreds: '用户名或密码错误。',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',
    },
    adminDashboard: {
      welcome: '欢迎回来，管理员',
      subtitle: '实时监控销售额、订单状态与库存提醒。',
      totalRevenue: '总营业额',
      totalOrders: '总订单数',
      totalProducts: '产品数量',
      totalCustomers: '客户总数',
      revenueChart: '销售趋势图',
      recentOrders: '最新 WhatsApp 订单',
      topProducts: '热销产品',
      orderNumber: '订单号',
      customer: '客户',
      amount: '金额',
      status: '状态',
      date: '日期',
      viewAll: '查看全部',
      period7d: '近7天',
      period30d: '近30天',
      period90d: '近90天',
      periodCustom: '自定义日期',
      from: '从',
      to: '至',
    },
    adminOrders: {
      title: '订单管理',
      subtitle: '查看、更新运单号并打印发票。',
      searchPlaceholder: '搜索订单号、客户姓名...',
      filterAll: '全部订单',
      filterNew: '新订单',
      filterProcessing: '处理中',
      filterShipped: '已发货',
      filterDelivered: '已送达',
      filterCancelled: '已取消',
      thOrder: '订单号',
      thCustomer: '客户',
      thItems: '商品',
      thTotal: '总计',
      thStatus: '状态',
      thDate: '日期',
      thAction: '操作',
      noOrders: '暂无订单记录。',
      viewDetail: '查看详情',
      updateStatus: '更新状态',
      orderDetail: '订单详情',
      backToOrders: '返回订单列表',
      customerInfo: '客户信息',
      orderItems: '商品明细',
      shippingAddress: '送货地址',
      notes: '备注',
      timeline: '时间线',
    },
    adminProducts: {
      title: '产品管理',
      subtitle: '添加、编辑规格与更新库存。',
      addNew: '添加新产品',
      searchPlaceholder: '搜索产品名称、SKU...',
      thImage: '图片',
      thName: '名称',
      thCategory: '分类',
      thPrice: '价格',
      thStock: '库存',
      thStatus: '状态',
      thAction: '操作',
      edit: '编辑',
      delete: '删除',
      noProducts: '未找到产品。',
      active: '上架',
      draft: '草稿',
      newProduct: '新建产品',
      editProduct: '编辑产品',
      productName: '产品名称',
      productSlug: '产品 Slug',
      productDesc: '产品描述',
      productCategory: '产品分类',
      productImage: '主图',
      productVariants: '规格',
      saveProduct: '保存产品',
      saving: '保存中...',
    },
    adminCategories: {
      title: '分类管理',
      subtitle: '管理原料分类与展示顺序。',
      addNew: '添加分类',
      nameLabel: '分类名称',
      slugLabel: 'Slug',
      descLabel: '描述',
      imageLabel: '分类图片',
      saveBtn: '保存分类',
      editBtn: '编辑',
      deleteBtn: '删除',
      cancelBtn: '取消',
      noCategories: '暂无分类。',
      confirmDelete: '确定要删除此分类吗？',
    },
    adminBlogs: {
      title: '博客与视频',
      subtitle: '发布文章与烘焙教学视频。',
      createNew: '发布文章/视频',
      searchPlaceholder: '搜索标题...',
      thTitle: '标题',
      thType: '类型',
      thDate: '日期',
      thStatus: '状态',
      thAction: '操作',
      edit: '编辑',
      delete: '删除',
      publish: '发布',
      unpublish: '取消发布',
      noBlogs: '暂无文章。',
      typeArticle: '图文文章',
      typeVideo: '视频教程',
      blogTitle: '标题',
      blogSlug: 'Slug',
      blogExcerpt: '摘要',
      blogContent: '内容',
      blogImage: '封面图',
      blogVideoUrl: '视频链接',
      saveDraft: '保存草稿',
      publishBtn: '发布',
    },
    adminBanners: {
      title: '横幅管理',
      subtitle: '管理首页轮播横幅与宣传图。',
      addNew: '添加横幅',
      thImage: '图片',
      thTitle: '标题',
      thLink: '链接',
      thStatus: '状态',
      thAction: '操作',
      edit: '编辑',
      delete: '删除',
      noBanners: '暂无横幅。',
      bannerTitle: '标题',
      bannerSubtitle: '副标题',
      bannerLink: '按钮链接',
      bannerImage: '横幅图片',
      saveBtn: '保存横幅',
    },
    adminVouchers: {
      title: '优惠券管理',
      subtitle: '设置促销折扣代码。',
      addNew: '创建优惠券',
      thCode: '代码',
      thTitle: '名称',
      thDiscount: '折扣',
      thMinSpend: '最低消费',
      thStatus: '状态',
      thAction: '操作',
      edit: '编辑',
      delete: '删除',
      noVouchers: '暂无优惠券。',
      voucherCode: '优惠码',
      voucherTitle: '优惠券名称',
      discountType: '折扣类型',
      discountValue: '折扣数值',
      minSpend: '最低消费金额',
      statusActive: '生效中',
      statusInactive: '已禁用',
      saveBtn: '保存优惠券',
    },
    adminCustomers: {
      title: '客户 CRM',
      subtitle: '管理客户名单与消费记录。',
      searchPlaceholder: '搜索客户姓名、电话、邮箱...',
      filterAll: '全部客户',
      filterRetail: '零售客户',
      filterWholesale: '批发客户',
      thName: '姓名',
      thEmail: '邮箱',
      thPhone: '电话',
      thType: '类型',
      thOrders: '订单数',
      thSpent: '消费总额',
      thJoined: '注册时间',
      noCustomers: '暂无客户数据。',
    },
    adminRecipes: {
      title: '食谱管理',
      subtitle: '管理烘焙食谱与关联产品。',
      addNew: '添加食谱',
      thTitle: '标题',
      thCategory: '分类',
      thDifficulty: '难度',
      thStatus: '状态',
      thAction: '操作',
      edit: '编辑',
      delete: '删除',
      noRecipes: '暂无食谱。',
    },
    adminSettings: {
      title: '店铺设置',
      subtitle: '配置 WhatsApp 号码与管理员密码。',
      storeInfo: '店铺基本信息',
      storeName: '店铺名称',
      storeDesc: '描述',
      whatsappNumber: 'WhatsApp 电话号码',
      adminCredentials: '管理员密码修改',
      adminEmail: '管理员邮箱',
      adminPassword: '新密码',
      saveSettings: '保存设置',
      saving: '保存中...',
      saved: '设置已保存',
    },
    common: {
      exploreAll: '查看全部',
      viewDetails: '查看详情',
      readArticle: '阅读文章',
      viewRecipe: '查看食谱',
      trackParcel: '追踪包裹',
      contactSupport: '联系客服',
      allCategories: '全部分类',
      halalOnly: '仅显示清真认证',
      sortBy: '排序方式',
      reset: '重置',
      productsCount: '件产品',
      noResults: '未找到相关结果',
      loading: '加载中...',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      create: '新建',
      update: '更新',
      search: '搜索',
      filter: '筛选',
      actions: '操作',
      view: '查看',
      detail: '详情',
      upload: '上传',
      download: '下载',
      export: '导出',
      import: '导入',
      print: '打印',
      publish: '发布',
      unpublish: '取消发布',
      approve: '批准',
      reject: '拒绝',
      back: '返回',
      next: '下一步',
      previous: '上一步',
      close: '关闭',
      confirm: '确认',
      yes: '是',
      no: '否',
      or: '或',
      and: '和',
      all: '全部',
      none: '无',
      required: '必填',
      optional: '选填',
    },
    trustBadges: {
      b1Title: '100% 清真认证',
      b1Desc: '所有原料均经过 JAKIM 清真认证',
      b2Title: '进口优质品质',
      b2Desc: '直采比利时巧克力与新西兰黄油',
      b3Title: '全马快速配送',
      b3Desc: '专业包装，安全准时送达',
      b4Title: '批发专享优惠',
      b4Desc: '烘焙坊与商业客户大包装特惠',
    },
    adminCashflow: {
      title: '财务流水',
      subtitle: '记录支出与监控净利润。',
      addExpenseBtn: '记录新支出',
      card1Label: '总进账（销售额）',
      card1Sub: '自动计入已发货订单',
      card2Label: '总出账（运营支出）',
      card2Sub: '采购、物流与仓库费用',
      card3Label: '净利润',
      card3Sub: '进账扣除出账后的收益',
      card4Label: '支出记录笔数',
      card4Sub: '成功记录的总笔数',
      journalTitle: '财务收支明细表',
      filterLabel: '筛选类型：',
      filterAll: '全部记录',
      thDate: '日期',
      thType: '类型',
      thCategory: '分类',
      thDesc: '说明',
      thAmount: '金额',
      thAction: '操作',
      inflowTag: '进账 (+)',
      outflowTag: '出账 (-)',
    },
    customerAccount: {
      loginTitle: '登录您的账户',
      loginSubtitle: '输入您的凭据以访问您的订单与资料。',
      registerTitle: '注册新账户',
      registerSubtitle: '创建账户以享受更快的结账体验。',
      forgotTitle: '找回密码',
      forgotSubtitle: '输入注册邮箱以接收 OTP 重置代码。',
      dashboardTitle: '客户控制面板',
      dashboardSubtitle: '管理您的资料、送货地址与订单记录。',
      phoneOrEmail: '邮箱地址 / 电话号码',
      password: '密码',
      confirmPassword: '确认密码',
      fullName: '全名',
      phoneNumber: '电话号码',
      emailAddress: '邮箱地址',
      loginBtn: '登录',
      registerBtn: '注册账户',
      resetBtn: '重置密码',
      loggingIn: '登录中...',
      registering: '注册中...',
      noAccount: '还没有账户？点击注册',
      hasAccount: '已有账户？点击登录',
      forgotPassword: '忘记密码？',
      orContinueWith: '或继续使用',
      rememberMe: '记住我',
      logoutBtn: '退出登录',
      profileTitle: '个人资料',
      orderHistory: '订单历史',
      wishlistTitle: '收藏夹',
      addressBook: '送货地址簿',
      editProfile: '编辑资料',
      saveProfile: '保存资料',
      address: '详细地址',
      city: '城市',
      state: '州属',
      postcode: '邮政编码',
      wrongCredentials: '账号或密码错误。',
      emailExists: '该邮箱已被注册。',
      phoneExists: '该电话号码已被注册。',
      passwordMismatch: '两次输入的密码不一致。',
      passwordMinLength: '密码长度至少需 6 位。',
      verifyIdentity: '身份验证',
      enterOtp: '输入发送至您邮箱的 6 位 OTP 代码',
      securityCheck: '安全检查',
      showPassword: '显示密码',
      hidePassword: '隐藏密码',
      rateLimitWarning: '尝试次数过多，请稍后再试。',
      accountLocked: '账户已被锁定。',
      returnToStore: '返回主页',
    },
    faq: {
      title: '常见问题解答 (FAQ)',
      subtitle: '查找关于原料清真认证、配送与批发采购的常见解答。',
      searchPlaceholder: '搜索问题或关键词...',
      noResults: '未找到匹配的问题。',
      contactUs: '仍有疑问？联系我们的客服团队',
      contactNote: '我们随时为您解答任何问题。',
    },
    status: {
      new: '新订单',
      processing: '处理中',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
      active: '已启用',
      inactive: '已禁用',
      draft: '草稿',
      published: '已发布',
      pending: '待处理',
      completed: '已完成',
      refunded: '已退款',
    },
    adminExtra: {
      liveMetrics: '实时指标',
      revenueToday: '今日营业额',
      revenueMonth: '本月营业额',
      today: '今日',
      thisMonth: '本月',
      bestSeller: '热销榜',
      noDataYet: '暂无数据',
      sold: '已售出',
      lowStock: '库存紧张',
      products: '产品',
      restockRequired: '需要补货',
      stockHealthy: '库存充足',
      chartTitle: '营业额趋势图',
      chartSubtitle: '过去指定时间段内的销售总额变化。',
      days7: '近7天',
      days30: '近30天',
      year1: '近1年',
      calendar: '日历',
      fromDate: '开始日期',
      toDate: '结束日期',
      chartAutoUpdate: '数据实时自动更新',
      totalOmset: '总营业额',
      totalOrders: '总订单数',
      avgOrder: '平均订单金额',
      order: '笔订单',
      orders: '笔订单',
      omsetLabel: '营业额',
      ordersLabel: '订单',
      dateLabel: '日期',
      noDataPeriod: '该时间段内暂无销售数据',
      manageResi: '管理运单号',
      shortcutCategories: '分类',
      shortcutRecipes: '食谱',
      shortcutBlogs: '博客',
      shortcutVouchers: '优惠券',
      shortcutCustomers: '客户',
      shortcutSettings: '设置',
      recentWAOrders: '最新订单',
      recentWAOrdersSub: '最近收到的 WhatsApp 订单记录。',
      viewAllOrders: '查看所有订单',
      thPhotoProduct: '产品图片',
      thOrderNumber: '订单号',
      thWACustomer: '客户',
      thTotalPayment: '付款总额',
      thStatusResi: '状态 / 运单',
      thAdminAction: '操作',
      bakingPackage: '烘焙套餐',
      variant: '规格',
      item: '件',
      items: '件',
      chatWA: 'WhatsApp 沟通',
      pendingResi: '待录入运单',
      resiNumber: '运单号',
      processOrder: '处理订单',
      viewDetailOrder: '订单详情',
      stockAlertTitle: '库存预警',
      stockAlertSub: '低于安全线的库存商品。',
      stockRemaining: '剩余库存',
      restockNow: '立即补货',
      stockSafe: '所有产品库存安全',
      cfFilterTimeRange: '时间范围：',
      cfAvgPerPeriod: '平均每期',
      cfPeakHighest: '峰值最高',
      cfStatusPerformance: '财务健康度',
      cfHealthy: '健康',
      cfWarning: '需注意',
      cfTotalInflow: '总进账',
      cfTotalOutflow: '总出账',
      cfNetProfit: '净利润',
      cfOrderSales: '订单销售收入',
      cfAuto: '自动计入',
      cfReduceNet: '扣除运营支出',
      cfDateLabel: '日期',
      cfCategoryLabel: '分类',
      cfDescLabel: '说明',
      cfAmountLabel: '金额',
      cfCancel: '取消',
      cfSave: '保存',
      cfActive: '生效中',
      cfCatHPP: '采购成本 (HPP)',
      cfCatPackaging: '包装耗材',
      cfCatCourier: '物流快递',
      cfCatWarehouse: '仓库租金',
      cfCatOther: '其他费用',
      cfNoExpenses: '暂无支出记录。',
      ordersTitle: '订单管理',
      ordersSubtitle: '处理与更新您的所有订单。',
      ordersThPhoto: '图片',
      ordersThOrderNo: '订单号',
      ordersThCustomer: '客户',
      ordersThTotal: '总额',
      ordersThStatus: '状态',
      ordersThAction: '操作',
      ordersResiPending: '待输入运单',
      ordersNoOrders: '暂无订单。',
      orderNotFound: '未找到订单',
      orderBackToList: '返回订单列表',
      orderCustomerName: '客户姓名',
      orderDeliveryAddress: '送货地址',
      orderCustomerNote: '客户备注',
      orderNoNote: '无备注',
      orderItemsOrdered: '订购商品明细',
      orderItemQty: '数量',
      orderTotal: '总金额',
      orderUpdateStatus: '更新状态',
      orderTrackingNo: '快递运单号',
      orderTrackingPlaceholder: '输入运单号...',
      orderSaveTracking: '保存运单号',
      orderTimeline: '订单时间线',
      orderPrintInvoice: '打印发票',
      orderPrintReceipt: '打印收据',
      orderChatCustomer: '联系客户',
      productsExport: '导出 CSV',
      productsImport: '导入 CSV',
      productsDeleteConfirm: '确定要删除此产品吗？',
      productsVariants: '规格',
      productsSKU: 'SKU',
      productsStock: '库存',
      productsPrice: '价格',
      videosTitle: '教学视频',
      videosSubtitle: '管理首页与博客的视频内容。',
      videosAddNew: '添加新视频',
      videosThThumbnail: '缩略图',
      videosThTitle: '标题',
      videosThPlatform: '平台',
      videosThStatus: '状态',
      videosThAction: '操作',
      videosNoVideos: '暂无视频。',
      videosVideoTitle: '视频标题',
      videosVideoUrl: '视频 URL',
      videosPlatform: '视频平台',
      videosSaveVideo: '保存视频',
      videosUploadFile: '上传视频文件',
      videosUploadMP4: '支持 MP4 / WebM',
      settingsTabStore: '基本信息',
      settingsTabBackup: '数据备份',
      settingsTabAudit: '审计日志',
      settingsBackupTitle: '数据库备份与恢复',
      settingsBackupSub: '导出 JSON 备份文件或导入历史恢复点。',
      settingsBackupBtn: '导出数据库 JSON',
      settingsRestoreBtn: '恢复数据库 JSON',
      settingsAuditTitle: '系统审计日志',
      settingsAuditSub: '查看敏感操作的操作记录。',
      settingsAuditNoLogs: '暂无日志。',
      customersMemberTier: '会员等级',
      customersTierRetail: '普通零售',
      customersTierVIP: 'VIP 客户',
      customersTierWholesale: '商业批发',
      blogsUploadMP4: '上传视频 MP4',
      categoriesUploadFile: '上传分类图片',
      uploadFile: '上传文件',
      confirmDeleteTitle: '确认删除',
      confirmDeleteMsg: '您确定要删除此记录吗？此操作无法撤销。',
      noData: '暂无数据',
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

  // Helper to sync Google Translate widget & cookie
  const syncGoogleTranslate = (lang: LanguageCode) => {
    if (typeof window === 'undefined') return;
    try {
      const gtLangMap: Record<LanguageCode, string> = {
        MS: 'ms',
        ID: 'id',
        EN: 'en',
        ZH: 'zh-CN',
      };
      const googTransMap: Record<LanguageCode, string> = {
        MS: '/ms/ms',
        ID: '/ms/id',
        EN: '/ms/en',
        ZH: '/ms/zh-CN',
      };

      const targetGtLang = gtLangMap[lang] || 'ms';
      const googTarget = googTransMap[lang] || '/ms/ms';

      // Set cookies for Google Translate widget across root and domain
      document.cookie = `googtrans=${googTarget}; path=/; max-age=31536000;`;
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length >= 2) {
        const rootDomain = '.' + domainParts.slice(-2).join('.');
        document.cookie = `googtrans=${googTarget}; path=/; domain=${rootDomain}; max-age=31536000;`;
      }
      document.cookie = `googtrans=${googTarget}; path=/; domain=${window.location.hostname}; max-age=31536000;`;

      // Update Google Translate select element if loaded in DOM
      const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (gtCombo) {
        gtCombo.value = targetGtLang;
        gtCombo.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Failed to sync Google Translate combo element:', e);
    }
  };

  // Load saved language on mount from localStorage or cookie
  useEffect(() => {
    try {
      const isAdminPath = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/admin2026'));
      const storageKey = isAdminPath ? 'fbs_admin_language' : 'fbs_language';
      
      let saved = localStorage.getItem(storageKey);
      if (!saved && !isAdminPath) {
        const match = document.cookie.match(/(?:^|; )fbs_language=([^;]*)/);
        if (match) saved = match[1];
      }
      if (saved && (saved === 'MS' || saved === 'ID' || saved === 'EN' || saved === 'ZH')) {
        setLangState(saved as LanguageCode);
        if (!isAdminPath) {
          syncGoogleTranslate(saved as LanguageCode);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved language from storage/cookie:', e);
    }
  }, []);

  // Sync across tabs/windows & custom events
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      const isAdminPath = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/admin2026'));
      const expectedKey = isAdminPath ? 'fbs_admin_language' : 'fbs_language';
      
      if (e.key === expectedKey && e.newValue) {
        const lang = e.newValue as LanguageCode;
        if (['MS', 'ID', 'EN', 'ZH'].includes(lang)) {
          setLangState(lang);
          if (!isAdminPath) {
            syncGoogleTranslate(lang);
          }
        }
      }
    };

    const handleCustomEvent = (e: any) => {
      if (e.detail?.lang && ['MS', 'ID', 'EN', 'ZH'].includes(e.detail.lang)) {
        setLangState(e.detail.lang as LanguageCode);
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('fbs_language_changed', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('fbs_language_changed', handleCustomEvent);
    };
  }, []);

  const setLanguage = React.useCallback((lang: LanguageCode) => {
    setLangState(lang);
    try {
      const isAdminPath = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/admin2026'));
      
      if (isAdminPath) {
        // Admin Dashboard only uses internal React state & separate storage
        localStorage.setItem('fbs_admin_language', lang);
        window.dispatchEvent(new StorageEvent('storage', { key: 'fbs_admin_language', newValue: lang }));
        window.dispatchEvent(new CustomEvent('fbs_language_changed', { detail: { lang } }));
      } else {
        // Customer Website uses fbs_language, googtrans cookies & Google Translate
        localStorage.setItem('fbs_language', lang);
        document.cookie = `fbs_language=${lang}; path=/; max-age=31536000;`;
        syncGoogleTranslate(lang);

        window.dispatchEvent(new StorageEvent('storage', { key: 'fbs_language', newValue: lang }));
        window.dispatchEvent(new CustomEvent('fbs_language_changed', { detail: { lang } }));

        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (e) {
      console.warn('Failed to save setLanguage state:', e);
    }
  }, []);

  const providerValue = React.useMemo(() => ({
    language,
    setLanguage,
    t: dictionaries[language],
  }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={providerValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
