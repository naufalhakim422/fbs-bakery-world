'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'MS' | 'ID' | 'EN';

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
      };
      const googTransMap: Record<LanguageCode, string> = {
        MS: '/ms/ms',
        ID: '/ms/id',
        EN: '/ms/en',
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
    } catch (e) {}
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
      if (saved && (saved === 'MS' || saved === 'ID' || saved === 'EN')) {
        setLangState(saved as LanguageCode);
        if (!isAdminPath) {
          syncGoogleTranslate(saved as LanguageCode);
        }
      }
    } catch (e) {}
  }, []);

  // Sync across tabs/windows & custom events
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      const isAdminPath = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/admin2026'));
      const expectedKey = isAdminPath ? 'fbs_admin_language' : 'fbs_language';
      
      if (e.key === expectedKey && e.newValue) {
        const lang = e.newValue as LanguageCode;
        if (['MS', 'ID', 'EN'].includes(lang)) {
          setLangState(lang);
          if (!isAdminPath) {
            syncGoogleTranslate(lang);
          }
        }
      }
    };

    const handleCustomEvent = (e: any) => {
      if (e.detail?.lang && ['MS', 'ID', 'EN'].includes(e.detail.lang)) {
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

  const setLanguage = (lang: LanguageCode) => {
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
    } catch (e) {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: dictionaries[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
