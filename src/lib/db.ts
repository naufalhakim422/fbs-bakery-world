import { Product, Category, Order, OrderTimelineEvent, Recipe, Blog, Banner, StoreSetting, Customer, AboutSetting, HomePageSetting, AdminCredentialSetting, ProductReview, VideoPost, StockHistoryLog, ShippingCourier, ShippingState, WeightBracket, ShippingRate, ProductShareLog } from '@/types';

function normalizePhoneDigits(phoneStr?: string): string {
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

let categoriesData: Category[] = [
  {
    id: 'cat-1',
    name: 'Flour & Powder',
    slug: 'flour-and-powder',
    description: 'High-grade baking flours, semolina, starch, and specialty powders.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    sortOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Chocolate & Cocoa',
    slug: 'chocolate-and-cocoa',
    description: 'Couverture chocolate, chips, compound, and Dutch processed cocoa powder.',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
    sortOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Baking Ingredients',
    slug: 'baking-ingredients',
    description: 'Pure New Zealand butter, yeast, whipping cream, cheese, and vanilla.',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
    sortOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Cake Decoration',
    slug: 'cake-decoration',
    description: 'Edible gold leaf, sprinkles, fondant, food coloring, and luxury toppers.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
    sortOrder: 4,
  },
  {
    id: 'cat-5',
    name: 'Baking Tools',
    slug: 'baking-tools',
    description: 'Commercial mixers, cake molds, silicone spatulas, and baking pans.',
    image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop',
    sortOrder: 5,
  },
  {
    id: 'cat-6',
    name: 'Packaging Supply',
    slug: 'packaging-supply',
    description: 'Food-safe cake boxes, packaging ribbons, clear bags, and sticker labels.',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=800&auto=format&fit=crop',
    sortOrder: 6,
  },
];

let initialProducts: Product[] = [];

let recipesData: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Signature Belgian Dark Chocolate Cake',
    slug: 'signature-belgian-dark-chocolate-cake',
    coverImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
    description: 'Learn how to bake an ultra moist, decadent Belgian dark chocolate cake coated with shiny ganache.',
    ingredients: [
      '200g Belgian Dark Chocolate Chips 70%',
      '150g Valrhona Cocoa Powder',
      '250g Anchor Unsalted Butter',
      '300g Semolina / Cake Flour',
      '200g Superfine Sugar',
      '4 Large Grade A Eggs'
    ],
    instructions: [
      'Preheat oven to 170°C and line two 8-inch cake pans with parchment paper.',
      'Melt Belgian Dark Chocolate Chips and Anchor Butter together over double boiler until smooth.',
      'Sift Semolina Flour and Valrhona Cocoa Powder into a large bowl.',
      'Beat eggs and sugar until pale and fluffy, then gently fold melted chocolate mixture.',
      'Bake for 35 minutes until toothpick inserted comes out clean with moist crumbs.',
      'Decorate with 24K Edible Gold Leaf flakes for a royal luxury finish.'
    ],
    difficulty: 'Medium',
    cookingTime: 45,
    relatedProductIds: ['prod-1', 'prod-3', 'prod-4', 'prod-5', 'prod-8'],
    createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'rec-2',
    title: 'Kyoto Uji Matcha Lava Tart',
    slug: 'kyoto-uji-matcha-lava-tart',
    coverImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
    description: 'Crumbly buttery pastry shell filled with silky molten Uji matcha ganache.',
    ingredients: [
      '30g Uji Matcha Powder Grade A',
      '150g Anchor Unsalted Butter (Chilled)',
      '200g Premium Flour',
      '100ml Heavy Whipping Cream',
      '120g White Chocolate Couverture'
    ],
    instructions: [
      'Rub chilled Anchor butter into flour until breadcrumb texture forms.',
      'Roll out dough, fit into tart rings and blind bake at 180°C for 18 minutes.',
      'Heat whipping cream and pour over white chocolate; whisk until smooth.',
      'Sift in Uji Matcha Powder and blend until rich emerald green ganache forms.',
      'Pour filling into baked shells and chill for 2 hours before serving.'
    ],
    difficulty: 'Easy',
    cookingTime: 30,
    relatedProductIds: ['prod-2', 'prod-4'],
    createdAt: '2026-06-15T08:00:00Z',
  }
];

let initialBlogs: Blog[] = [
  {
    id: 'blog-1',
    type: 'ARTICLE',
    title: '5 Secrets to Baking Soft and Fluffy Cakes Every Time',
    slug: '5-secrets-to-baking-soft-and-fluffy-cakes',
    excerpt: 'Discover how ingredient temperature, flour sifting, and oven precision elevate your bakery creations.',
    content: `Baking is a science where precision meets culinary art. Whether you are running a home bakery business or preparing desserts for your family, achieving consistent height and soft sponge texture requires mastering key baking fundamentals.`,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
    contentBlocks: [
      { id: 'b1-1', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop', caption: 'Room temperature butter is key', text: '1. Bring Dairy & Eggs to Room Temperature — Cold butter or eggs can curdle cake batters. Ensure butter is softened at 20-22°C for optimal air emulsification.' },
      { id: 'b1-2', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?q=80&w=800&auto=format&fit=crop', caption: 'Always sift your flour', text: '2. Always Sift Your Flour & Powders — Sifting Semolina or Cake Flour aerates the dry ingredients, eliminating lumps and creating a delicate crumb structure.' },
      { id: 'b1-3', text: '3. Use High Quality Butter & Cocoa — Anchor New Zealand Butter or Valrhona Cocoa Powder provide natural moisture that lasts for days. 4. Avoid Overmixing. 5. Measure by Weight, Not Volume.' },
    ],
    author: 'Chef Ahmad, FBS Master Baker',
    tags: ['baking tips', 'flour', 'butter'],
    createdAt: '2026-07-01T08:00:00Z',
  },
  {
    id: 'blog-2',
    type: 'ARTICLE',
    title: 'Couverture vs Compound Chocolate: The Ultimate Bakery Guide',
    slug: 'couverture-vs-compound-chocolate-guide',
    excerpt: 'Understanding cocoa butter content, tempering techniques, and flavor profiles for professional pastry chefs.',
    content: `Choosing the right chocolate is one of the most critical decisions for cake designers and pastry shops. Couverture Chocolate (e.g. Callebaut 70%) contains pure cocoa butter and requires tempering but delivers irresistible snap and luxurious melt.`,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
    contentBlocks: [
      { id: 'b2-1', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop', caption: 'Belgian Couverture Chocolate', text: 'Couverture Chocolate (e.g. Callebaut 70%) contains pure cocoa butter (minimum 31%). It requires tempering but delivers an irresistible snap and high gloss mouthfeel.' },
      { id: 'b2-2', text: 'Compound Chocolate replaces cocoa butter with vegetable fats. No tempering required, ideal for quick dipping and chocolate molds in humid climates.' },
    ],
    author: 'FBS Technical Team',
    tags: ['chocolate', 'couverture', 'pastry'],
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'blog-3',
    type: 'VIDEO',
    title: 'Viral: Cara Buat Croissant Butter Lapis di Rumah 🥐',
    slug: 'cara-buat-croissant-butter-lapis',
    excerpt: 'Tutorial lengkap membuat croissant butter berlapis ala bakery Perancis yang kini viral di TikTok & YouTube.',
    content: 'Video tutorial membuat croissant berlapis yang viral.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
    author: 'FBS Baker Channel',
    tags: ['viral', 'croissant', 'video tutorial'],
    createdAt: '2026-07-20T08:00:00Z',
  }
];

let initialVideos: VideoPost[] = [
  {
    id: 'vid-1',
    title: 'Cara Buat Croissant Butter Lapis di Rumah 🥐',
    description: 'Tutorial lengkap membuat croissant butter berlapis ala Perancis yang renyah di luar dan lembut di dalam.',
    platform: 'YOUTUBE',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
    duration: '12:45',
    category: 'Croissant',
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: '2026-07-28T08:00:00Z',
  },
  {
    id: 'vid-2',
    title: 'Baking Tips: Semolina Flour Cake Demo 🍰',
    description: 'Rahasia membuat bolu semolina khas Timur Tengah yang lembut dan tidak seret saat dimakan.',
    platform: 'FBS',
    embedUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-kneading-dough-on-a-table-42938-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    duration: '08:15',
    category: 'Cake',
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: '2026-07-29T10:00:00Z',
  },
  {
    id: 'vid-3',
    title: 'NEW MENU CAKE : ICEBERG CHEESE CAKE 🍰',
    description: 'Hye Sek Awokk It\'s been a while since we uploaded our latest cake video, which is ICEBERG CHEESE CAKE 🎂. Can be found at FBS BAKERY WORLD CHUKAI KEMAMAN 🎂. Don\'t forget to try it YAAAA & Tag us in SEK AWOKK\'S STORY 🤩.',
    platform: 'FACEBOOK',
    embedUrl: 'https://www.facebook.com/watch/?v=123456789',
    thumbnail: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
    duration: '05:30',
    category: 'Cake',
    status: 'PUBLISHED',
    isFeatured: true,
    createdAt: '2026-07-30T12:00:00Z',
  }
];


let initialBanners: Banner[] = [
  {
    id: 'ban-1',
    title: 'Semolina & Italian Flour Special Promo',
    subtitle: 'Best Semolina Flour & Specialty Baking Powder for Soft Fluffy Pastries and Artisan Breads.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'SHOP PRODUCT NOW',
    buttonLink: '/products/semolina-flour-premium-grade',
    status: true,
  },
  {
    id: 'ban-2',
    title: 'Kyoto Uji Matcha Grade A Diskon 15%',
    subtitle: 'Authentic Emerald Green Uji Matcha Powder for Artisan Matcha Lava Tarts & Beverages.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'LIHAT PRODUK PROMO',
    buttonLink: '/products/uji-matcha-powder-grade-a',
    status: true,
  },
  {
    id: 'ban-3',
    title: 'Belgian Dark Couverture Chocolate 70%',
    subtitle: 'Rich Creamy Dutch Processed Chocolate Chips for Bakery & Cafe Desserts.',
    imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'PESAN PRODUK DISKON',
    buttonLink: '/products/belgian-dark-chocolate-chips-70',
    status: true,
  },
  {
    id: 'ban-4',
    title: 'Commercial Stand Mixer 10L New Arrival',
    subtitle: 'Heavy-duty stainless steel mixer with multi-speed gear drive for commercial bakeries.',
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'CEK BARANG BARU',
    buttonLink: '/products/professional-heavy-duty-stand-mixer-7l',
    status: true,
  }
];

let storeSettingData: StoreSetting = {
  whatsappNumber: '60103574196',
  whatsappNumber2: '60168765432',
  whatsappBusinessName: 'FBS Bakery World Support',
  storeName: 'FBS Bakery World',
  companyRegistrationName: 'FBS Bakery World (M) Sdn. Bhd. (1080422-V)',
  operatingHours: 'Senin - Jumat | 08.30 - 17.30',
  currency: 'RM',
  announcement: '✨ Free Shipping For Orders Above RM150! | Premium Baking Supply Partner Malaysia ✨',
  supportEmail: 'order@fbsbakeryworld.com',
  address: 'K9694,K9695,K9696 & K9697, Taman Pajak Utama, 24000 Chukai, Terengganu, Malaysia',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=FBS%20Bakery%20World%2C%20K9694%2CK9695%2CK9696%20%26%20K9697%2C%20Taman%20Pajak%20Utama%2C%2024000%20Chukai%2C%20Terengganu%2C%20Malaysia&t=&z=15&ie=UTF8&iwloc=&output=embed',
  googleMapsAppUrl: 'https://maps.google.com/?q=FBS+Bakery+World+Chukai+Terengganu',
};

let aboutSettingData: AboutSetting = {
  heroTitle: 'Empowering Bakers Across Malaysia with Pure, Certified Halal Ingredients',
  heroSubtitle: 'Sejak 2018, FBS Bakery World berdedikasi menyediakan bahan baku pastry, cokelat couverture, mentega impor New Zealand, dan peralatan baking terbaik untuk baker rumahan & kafe.',
  storyTitle: 'Perjalanan & Komitmen FBS Bakery World',
  storyParagraph1: 'Didirikan dengan passion mendalam terhadap seni pastry dan roti, FBS Bakery World bermula dari toko bahan kue keluarga di Shah Alam. Kami memahami tantangan para baker dalam menemukan bahan berkualitas konsisten dengan harga terjangkau.',
  storyParagraph2: 'Kini, kami melayani lebih dari 15.000+ pelanggan ritel dan grosir di seluruh Malaysia & Indonesia. Semua bahan dijamin 100% Halal, disimpan dalam fasilitas pengontrol suhu presisi tinggi, dan dikirim dengan standar keamanan terbaik.',
  heroImage: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1200&auto=format&fit=crop',
  statYears: '8+ Tahun',
  statBakers: '15.000+',
  statProducts: '1.200+',
  statSatisfaction: '99.8%',
  visionText: 'Menjadi mitra utama & pusat suplai bahan baking nomor 1 di Asia Tenggara yang paling dipercaya oleh komunitas baker profesional.',
  missionText: 'Menyediakan produk Halal berkualitas internasional, solusi grosir fleksibel, serta mengedukasi komunitas baker melalui resep dan tutorial gratis.',
};

let homePageSettingData: HomePageSetting = {
  heroTagline: '✨ MALAYSIA #1 HALAL BAKING INGREDIENTS SUPPLIER ✨',
  heroHeading: 'Premium Baking Ingredients & Tools For Professional Bakers',
  heroSubheading: 'Menyediakan tepung semolina, cokelat couverture Belgian 70%, mentega impor New Zealand, Uji matcha Jepang, hingga peralatan mixer komersial dengan pengiriman langsung dari Shah Alam.',
  heroPrimaryBtnText: 'EXPLORE PRODUCT CATALOG',
  heroPrimaryBtnLink: '/products',
  heroSecondaryBtnText: 'ORDER VIA WHATSAPP',
  heroSecondaryBtnLink: 'https://wa.me/60123456789',
  heroBgImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
  featuredTitle: 'Bahan Pastry & Baking Pilihan Utama',
  featuredSubtitle: 'Sangat disukai oleh baker rumahan, pastry chef profesional, dan kafe di seluruh Malaysia.',
  bestsellerTitle: 'Produk Paling Laris Minggu Ini',
  bestsellerSubtitle: 'Pilihan bahan kue terlaris dengan jaminan Halal 100% dan stok segar siap kirim.',
  promoTitle: 'Diskon Komersial & Pasokan Grosir Baker',
  promoSubtitle: 'Dapatkan penawaran harga spesial untuk pembelian karung 5kg & 25kg untuk pemilik usaha bakery dan kafe.',
  promoImage: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=1200&auto=format&fit=crop',
  wholesaleBanners: [
    {
      id: 'wpromo-1',
      title: 'Diskon Komersial & Pasokan Grosir Baker',
      subtitle: 'Dapatkan penawaran harga spesial untuk pembelian karung 5kg & 25kg.',
      imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
      buttonText: 'MINTA KATALOG GROSIR WA',
      buttonLink: 'https://wa.me/60123456789?text=Halo%20FBS%20Bakery,%20saya%20ingin%20minta%20katalog%20grosir',
    },
    {
      id: 'wpromo-2',
      title: 'Paket Impor Semolina & Tepung Italia 25kg',
      subtitle: 'Stok karung grosir 25kg khusus toko roti & pabrik kue.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      buttonText: 'LIHAT TEPUNG GROSIR',
      buttonLink: '/products/semolina-flour-premium-grade',
    },
    {
      id: 'wpromo-3',
      title: 'Grosir Kyoto Uji Matcha Grade A Bulk',
      subtitle: 'Kemasan drum aluminium 1kg & 5kg untuk cafe & artisan bakery.',
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      buttonText: 'CEK UJI MATCHA GROSIR',
      buttonLink: '/products/uji-matcha-powder-grade-a',
    },
    {
      id: 'wpromo-4',
      title: 'Diskon Peralatan Baking & Mixer Komersial',
      subtitle: 'Peralatan oven & mixer stainless steel heavy duty garansi resmi.',
      imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop',
      buttonText: 'LIHAT MIXER KOMERSIAL',
      buttonLink: '/products/professional-heavy-duty-stand-mixer-7l',
    }
  ]
};

let adminCredentialData: AdminCredentialSetting = {
  email: 'admin@fbsbakeryworld.com',
  password: 'admin123',
};

let initialOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'FB26000001',
    customerId: 'cust-1',
    customerName: 'Muhammad Jaka',
    customerEmail: 'nopaldeso1@gmail.com',
    customerPhone: '+60123456789',
    address: 'No 45, Jalan Bunga Raya 7/2, Section 7',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    notes: 'Mohon kemas rapi dengan bubble wrap tebal',
    courierName: 'J&T Express',
    totalAmount: 145.00,
    orderStatus: 'CONFIRMED',
    trackingNumber: 'JT6829104829MY',
    shippedAt: '2026-08-05T14:30:00Z',
    createdAt: '2026-08-05T10:15:00Z',
    updatedAt: '2026-08-05T14:30:00Z',
    items: [
      {
        id: 'oi-1-1',
        orderId: 'ord-1',
        productId: 'prod-1',
        productVariantId: 'var-1-2',
        productName: 'Semolina Flour Premium Grade',
        variantName: '1kg',
        price: 15.00,
        quantity: 2,
        subtotal: 30.00,
        mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'oi-1-2',
        orderId: 'ord-1',
        productId: 'prod-3',
        productVariantId: 'var-3-2',
        productName: 'Belgian Dark Chocolate Chips 70%',
        variantName: '1kg Pack',
        price: 62.00,
        quantity: 1,
        subtotal: 62.00,
        mainImage: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
      }
    ]
  },
  {
    id: 'ord-2',
    orderNumber: 'FB26000002',
    customerId: 'cust-2',
    customerName: 'Siti Nurhaliza',
    customerEmail: 'siti@example.com',
    customerPhone: '+60129876543',
    address: 'No 12, Jalan Bunga Raya, Section 7',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    notes: 'Pengiriman via Pos Laju',
    courierName: 'Pos Laju',
    totalAmount: 90.00,
    orderStatus: 'PENDING_PAYMENT',
    createdAt: '2026-08-05T16:20:00Z',
    updatedAt: '2026-08-05T16:20:00Z',
    items: [
      {
        id: 'oi-2-1',
        orderId: 'ord-2',
        productId: 'prod-2',
        productVariantId: 'var-2-2',
        productName: 'Uji Matcha Powder Grade A (Kyoto Import)',
        variantName: '250g Pack',
        price: 75.00,
        quantity: 1,
        subtotal: 75.00,
        mainImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      }
    ]
  },
  {
    id: 'ord-3',
    orderNumber: 'FB26000003',
    customerId: 'cust-3',
    customerName: 'Naufal Hakim Muzaki',
    customerEmail: 'nopalberak1@gmail.com',
    customerPhone: '0183942147',
    address: 'No 88, Jalan Universiti, Section 11',
    city: 'Petaling Jaya',
    state: 'Selangor',
    postcode: '46200',
    notes: 'Kirim saat jam kerja',
    courierName: 'J&T Express',
    totalAmount: 285.00,
    orderStatus: 'PACKING',
    createdAt: '2026-08-05T17:45:00Z',
    updatedAt: '2026-08-05T17:45:00Z',
    items: [
      {
        id: 'oi-3-1',
        orderId: 'ord-3',
        productId: 'prod-1',
        productVariantId: 'var-1-2',
        productName: 'Semolina Flour Premium Grade',
        variantName: '1kg',
        price: 15.00,
        quantity: 1,
        subtotal: 15.00,
        mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'oi-3-2',
        orderId: 'ord-3',
        productId: 'prod-2',
        productVariantId: 'var-2-3',
        productName: 'Uji Matcha Powder Grade A (Kyoto Import)',
        variantName: '1kg Bakery Pack',
        price: 270.00,
        quantity: 1,
        subtotal: 270.00,
        mainImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      }
    ]
  }
];

let initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Siti Nurhaliza',
    email: 'siti@example.com',
    phone: '+60129876543',
    customerType: 'VIP',
    isEmailVerified: true,
    address: 'No 12, Jalan Bunga Raya, Section 7',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    createdAt: '2026-05-10T08:00:00Z',
  }
];

let initialReviewsData: ProductReview[] = [];

let initialCouriers: ShippingCourier[] = [
  { id: 'cour-jnt', name: 'J&T Express', code: 'JNT', logo: '🚚', status: true, sortOrder: 1 },
  { id: 'cour-poslaju', name: 'Pos Laju', code: 'POSLAJU', logo: '📮', status: true, sortOrder: 2 },
  { id: 'cour-ninja', name: 'Ninja Van', code: 'NINJAVAN', logo: '🥷', status: true, sortOrder: 3 },
  { id: 'cour-flash', name: 'Flash Express', code: 'FLASH', logo: '⚡', status: true, sortOrder: 4 },
  { id: 'cour-spx', name: 'SPX Express', code: 'SPX', logo: '📦', status: true, sortOrder: 5 },
];

let initialShippingStates: ShippingState[] = [
  { id: 'st-sgr', name: 'Selangor', code: 'SGR', region: 'PENINSULAR', status: true },
  { id: 'st-kl', name: 'Kuala Lumpur', code: 'KL', region: 'PENINSULAR', status: true },
  { id: 'st-pj', name: 'Putrajaya', code: 'PJ', region: 'PENINSULAR', status: true },
  { id: 'st-jhr', name: 'Johor', code: 'JHR', region: 'PENINSULAR', status: true },
  { id: 'st-png', name: 'Penang', code: 'PNG', region: 'PENINSULAR', status: true },
  { id: 'st-prk', name: 'Perak', code: 'PRK', region: 'PENINSULAR', status: true },
  { id: 'st-mlk', name: 'Melaka', code: 'MLK', region: 'PENINSULAR', status: true },
  { id: 'st-kdh', name: 'Kedah', code: 'KDH', region: 'PENINSULAR', status: true },
  { id: 'st-phg', name: 'Pahang', code: 'PHG', region: 'PENINSULAR', status: true },
  { id: 'st-trg', name: 'Terengganu', code: 'TRG', region: 'PENINSULAR', status: true },
  { id: 'st-ktn', name: 'Kelantan', code: 'KTN', region: 'PENINSULAR', status: true },
  { id: 'st-nsn', name: 'Negeri Sembilan', code: 'NSN', region: 'PENINSULAR', status: true },
  { id: 'st-pls', name: 'Perlis', code: 'PLS', region: 'PENINSULAR', status: true },
  { id: 'st-sbh', name: 'Sabah', code: 'SBH', region: 'EAST_MALAYSIA', status: true },
  { id: 'st-swk', name: 'Sarawak', code: 'SWK', region: 'EAST_MALAYSIA', status: true },
  { id: 'st-lbn', name: 'Labuan', code: 'LBN', region: 'EAST_MALAYSIA', status: true },
];

let initialWeightBrackets: WeightBracket[] = [
  { id: 'wb-1', name: '0 - 1 kg', minWeightGrams: 0, maxWeightGrams: 1000, sortOrder: 1 },
  { id: 'wb-2', name: '1 - 2 kg', minWeightGrams: 1001, maxWeightGrams: 2000, sortOrder: 2 },
  { id: 'wb-3', name: '2 - 3 kg', minWeightGrams: 2001, maxWeightGrams: 3000, sortOrder: 3 },
  { id: 'wb-4', name: '3 - 5 kg', minWeightGrams: 3001, maxWeightGrams: 5000, sortOrder: 4 },
  { id: 'wb-5', name: '5 - 10 kg', minWeightGrams: 5001, maxWeightGrams: 10000, sortOrder: 5 },
  { id: 'wb-6', name: '10 - 20 kg', minWeightGrams: 10001, maxWeightGrams: 20000, sortOrder: 6 },
];

let initialShippingRates: ShippingRate[] = [
  // J&T Express rates
  { id: 'sr-jnt-pen-1', courierId: 'cour-jnt', stateCode: 'PENINSULAR', weightBracketId: 'wb-1', price: 8.00 },
  { id: 'sr-jnt-pen-2', courierId: 'cour-jnt', stateCode: 'PENINSULAR', weightBracketId: 'wb-2', price: 10.00 },
  { id: 'sr-jnt-pen-3', courierId: 'cour-jnt', stateCode: 'PENINSULAR', weightBracketId: 'wb-3', price: 12.00 },
  { id: 'sr-jnt-pen-4', courierId: 'cour-jnt', stateCode: 'PENINSULAR', weightBracketId: 'wb-4', price: 16.00 },
  { id: 'sr-jnt-pen-5', courierId: 'cour-jnt', stateCode: 'PENINSULAR', weightBracketId: 'wb-5', price: 25.00 },
  { id: 'sr-jnt-pen-6', courierId: 'cour-jnt', stateCode: 'PENINSULAR', weightBracketId: 'wb-6', price: 40.00 },

  { id: 'sr-jnt-east-1', courierId: 'cour-jnt', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-1', price: 16.00 },
  { id: 'sr-jnt-east-2', courierId: 'cour-jnt', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-2', price: 22.00 },
  { id: 'sr-jnt-east-3', courierId: 'cour-jnt', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-3', price: 28.00 },
  { id: 'sr-jnt-east-4', courierId: 'cour-jnt', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-4', price: 38.00 },
  { id: 'sr-jnt-east-5', courierId: 'cour-jnt', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-5', price: 60.00 },
  { id: 'sr-jnt-east-6', courierId: 'cour-jnt', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-6', price: 95.00 },

  // Pos Laju rates
  { id: 'sr-pos-pen-1', courierId: 'cour-poslaju', stateCode: 'PENINSULAR', weightBracketId: 'wb-1', price: 9.00 },
  { id: 'sr-pos-pen-2', courierId: 'cour-poslaju', stateCode: 'PENINSULAR', weightBracketId: 'wb-2', price: 11.50 },
  { id: 'sr-pos-pen-3', courierId: 'cour-poslaju', stateCode: 'PENINSULAR', weightBracketId: 'wb-3', price: 13.50 },
  { id: 'sr-pos-pen-4', courierId: 'cour-poslaju', stateCode: 'PENINSULAR', weightBracketId: 'wb-4', price: 17.50 },
  { id: 'sr-pos-pen-5', courierId: 'cour-poslaju', stateCode: 'PENINSULAR', weightBracketId: 'wb-5', price: 27.00 },
  { id: 'sr-pos-pen-6', courierId: 'cour-poslaju', stateCode: 'PENINSULAR', weightBracketId: 'wb-6', price: 42.00 },

  { id: 'sr-pos-east-1', courierId: 'cour-poslaju', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-1', price: 18.00 },
  { id: 'sr-pos-east-2', courierId: 'cour-poslaju', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-2', price: 25.00 },
  { id: 'sr-pos-east-3', courierId: 'cour-poslaju', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-3', price: 32.00 },
  { id: 'sr-pos-east-4', courierId: 'cour-poslaju', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-4', price: 42.00 },
  { id: 'sr-pos-east-5', courierId: 'cour-poslaju', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-5', price: 65.00 },
  { id: 'sr-pos-east-6', courierId: 'cour-poslaju', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-6', price: 105.00 },

  // Ninja Van rates
  { id: 'sr-ninja-pen-1', courierId: 'cour-ninja', stateCode: 'PENINSULAR', weightBracketId: 'wb-1', price: 8.50 },
  { id: 'sr-ninja-pen-2', courierId: 'cour-ninja', stateCode: 'PENINSULAR', weightBracketId: 'wb-2', price: 10.50 },
  { id: 'sr-ninja-pen-3', courierId: 'cour-ninja', stateCode: 'PENINSULAR', weightBracketId: 'wb-3', price: 12.50 },
  { id: 'sr-ninja-pen-4', courierId: 'cour-ninja', stateCode: 'PENINSULAR', weightBracketId: 'wb-4', price: 16.50 },
  { id: 'sr-ninja-pen-5', courierId: 'cour-ninja', stateCode: 'PENINSULAR', weightBracketId: 'wb-5', price: 26.00 },
  { id: 'sr-ninja-pen-6', courierId: 'cour-ninja', stateCode: 'PENINSULAR', weightBracketId: 'wb-6', price: 41.00 },

  { id: 'sr-ninja-east-1', courierId: 'cour-ninja', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-1', price: 17.00 },
  { id: 'sr-ninja-east-2', courierId: 'cour-ninja', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-2', price: 23.50 },
  { id: 'sr-ninja-east-3', courierId: 'cour-ninja', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-3', price: 30.00 },
  { id: 'sr-ninja-east-4', courierId: 'cour-ninja', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-4', price: 40.00 },
  { id: 'sr-ninja-east-5', courierId: 'cour-ninja', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-5', price: 62.00 },
  { id: 'sr-ninja-east-6', courierId: 'cour-ninja', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-6', price: 98.00 },

  // Flash Express rates
  { id: 'sr-flash-pen-1', courierId: 'cour-flash', stateCode: 'PENINSULAR', weightBracketId: 'wb-1', price: 7.50 },
  { id: 'sr-flash-pen-2', courierId: 'cour-flash', stateCode: 'PENINSULAR', weightBracketId: 'wb-2', price: 9.50 },
  { id: 'sr-flash-pen-3', courierId: 'cour-flash', stateCode: 'PENINSULAR', weightBracketId: 'wb-3', price: 11.50 },
  { id: 'sr-flash-pen-4', courierId: 'cour-flash', stateCode: 'PENINSULAR', weightBracketId: 'wb-4', price: 15.00 },
  { id: 'sr-flash-pen-5', courierId: 'cour-flash', stateCode: 'PENINSULAR', weightBracketId: 'wb-5', price: 24.00 },
  { id: 'sr-flash-pen-6', courierId: 'cour-flash', stateCode: 'PENINSULAR', weightBracketId: 'wb-6', price: 38.00 },

  { id: 'sr-flash-east-1', courierId: 'cour-flash', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-1', price: 15.00 },
  { id: 'sr-flash-east-2', courierId: 'cour-flash', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-2', price: 21.00 },
  { id: 'sr-flash-east-3', courierId: 'cour-flash', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-3', price: 27.00 },
  { id: 'sr-flash-east-4', courierId: 'cour-flash', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-4', price: 36.00 },
  { id: 'sr-flash-east-5', courierId: 'cour-flash', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-5', price: 55.00 },
  { id: 'sr-flash-east-6', courierId: 'cour-flash', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-6', price: 90.00 },

  // SPX Express rates
  { id: 'sr-spx-pen-1', courierId: 'cour-spx', stateCode: 'PENINSULAR', weightBracketId: 'wb-1', price: 7.00 },
  { id: 'sr-spx-pen-2', courierId: 'cour-spx', stateCode: 'PENINSULAR', weightBracketId: 'wb-2', price: 9.00 },
  { id: 'sr-spx-pen-3', courierId: 'cour-spx', stateCode: 'PENINSULAR', weightBracketId: 'wb-3', price: 11.00 },
  { id: 'sr-spx-pen-4', courierId: 'cour-spx', stateCode: 'PENINSULAR', weightBracketId: 'wb-4', price: 14.50 },
  { id: 'sr-spx-pen-5', courierId: 'cour-spx', stateCode: 'PENINSULAR', weightBracketId: 'wb-5', price: 23.00 },
  { id: 'sr-spx-pen-6', courierId: 'cour-spx', stateCode: 'PENINSULAR', weightBracketId: 'wb-6', price: 36.00 },

  { id: 'sr-spx-east-1', courierId: 'cour-spx', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-1', price: 14.50 },
  { id: 'sr-spx-east-2', courierId: 'cour-spx', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-2', price: 20.00 },
  { id: 'sr-spx-east-3', courierId: 'cour-spx', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-3', price: 26.00 },
  { id: 'sr-spx-east-4', courierId: 'cour-spx', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-4', price: 35.00 },
  { id: 'sr-spx-east-5', courierId: 'cour-spx', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-5', price: 52.00 },
  { id: 'sr-spx-east-6', courierId: 'cour-spx', stateCode: 'EAST_MALAYSIA', weightBracketId: 'wb-6', price: 85.00 },
];

const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed !== null && parsed !== undefined) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`Error reading ${key} from storage, using fallback:`, e);
    }
  }
  return fallback;
};

const sanitizeDataForStorage = (data: any): any => {
  if (!data) return data;
  if (typeof data === 'string') {
    if ((data.startsWith('data:image/') || data.startsWith('data:video/')) && data.length > 250000) {
      console.warn('Excessively large base64 payload detected, downsizing storage footprint.');
      return data.startsWith('data:video/')
        ? 'https://assets.mixkit.co/videos/preview/mixkit-chef-kneading-dough-on-a-table-42938-large.mp4'
        : 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop';
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeDataForStorage(item));
  }
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const k in data) {
      cleaned[k] = sanitizeDataForStorage(data[k]);
    }
    return cleaned;
  }
  return data;
};

export const saveToStorage = <T>(key: string, value: T) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('fbs_db_updated', { detail: { key } }));
    } catch (e: any) {
      console.warn(`localStorage QuotaExceededError for ${key}. Attempting automatic payload sanitization.`);
      try {
        localStorage.removeItem('fbs_logs');
        const sanitized = sanitizeDataForStorage(value);
        localStorage.setItem(key, JSON.stringify(sanitized));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('fbs_db_updated', { detail: { key } }));
      } catch (retryError) {
        console.error(`Storage capacity reached. Retaining in-memory state for ${key}.`, retryError);
      }
    }
  }
};

export const db = {
  // Products
  getProducts: (params?: { category?: string; search?: string; featured?: boolean; bestSeller?: boolean }) => {
    let list = loadFromStorage<Product[]>('fbs_products', initialProducts);
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = initialProducts;
      saveToStorage('fbs_products', initialProducts);
    }

    // Auto-migrate legacy cached localStorage values (1420, 850, 2100) to 0
    let hasLegacy = false;
    list = list.map(p => {
      if (p.totalSold && p.totalSold > 0 && ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8'].includes(p.id)) {
        hasLegacy = true;
        return { ...p, totalSold: 0 };
      }
      return p;
    });
    if (hasLegacy) {
      saveToStorage('fbs_products', list);
    }

    if (params?.category) {
      list = list.filter(p => p.categoryId === params.category || p.categoryName?.toLowerCase() === params.category?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.productName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (params?.featured) {
      list = list.filter(p => p.isFeatured);
    }
    if (params?.bestSeller) {
      list = list.filter(p => p.isBestSeller);
    }
    return list;
  },

  getProductBySlug: (slug: string): Product | undefined => {
    if (!slug) return undefined;
    let list = loadFromStorage<Product[]>('fbs_products', initialProducts);
    if (!list || list.length === 0) return undefined;

    // Auto-migrate legacy cached values
    let hasLegacy = false;
    list = list.map(p => {
      if (p.totalSold && p.totalSold > 0 && ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8'].includes(p.id)) {
        hasLegacy = true;
        return { ...p, totalSold: 0 };
      }
      return p;
    });
    if (hasLegacy) {
      saveToStorage('fbs_products', list);
    }

    const raw = String(slug).trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw).trim();
    } catch (e) {
      decoded = raw;
    }

    const norm = (s: string) => (s || '').toLowerCase().replace(/[_]/g, '-').trim();
    const target = norm(decoded);

    return list.find(p => norm(p.slug) === target || norm(p.id) === target);
  },

  getProductById: (id: string): Product | undefined => {
    const list = loadFromStorage<Product[]>('fbs_products', initialProducts);
    return list.find(p => p.id === id);
  },

  saveProduct: (product: Partial<Product>) => {
    const list = loadFromStorage<Product[]>('fbs_products', initialProducts);
    if (product.id) {
      const idx = list.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...product, updatedAt: new Date().toISOString() };
        saveToStorage('fbs_products', list);
        return list[idx];
      }
    }
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: product.sku || `FBS-PRD-${Math.floor(100 + Math.random() * 900)}`,
      productName: product.productName || 'New Product',
      slug: product.slug || (product.productName || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: product.categoryId || 'cat-1',
      categoryName: categoriesData.find(c => c.id === product.categoryId)?.name || 'Flour & Powder',
      brand: product.brand || 'FBS Choice',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      mainImage: product.mainImage || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      galleryImages: product.galleryImages || ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop'],
      isHalal: product.isHalal ?? true,
      isFeatured: product.isFeatured ?? false,
      isBestSeller: product.isBestSeller ?? false,
      status: product.status ?? true,
      totalSold: product.totalSold ?? 0, // NEW PRODUCTS DEFAULT TO 0 SOLD
      variants: product.variants || [
        { id: `var-${Date.now()}-1`, productId: `prod-${Date.now()}`, variantName: '1kg', weight: 1.0, price: 20.0, sku: `FBS-VAR-${Date.now()}`, stock: 50 }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newProd);
    saveToStorage('fbs_products', list);
    return newProd;
  },

  deleteProduct: (id: string) => {
    let list = loadFromStorage<Product[]>('fbs_products', initialProducts);
    list = list.filter(p => p.id !== id);
    saveToStorage('fbs_products', list);
    return true;
  },

  // Orders
  mergeOrderStatusOverrides: (ordersList: Order[]): Order[] => {
    const deletedIds = loadFromStorage<string[]>('fbs_deleted_order_ids', []);
    const overrides = loadFromStorage<Record<string, any>>('fbs_order_status_overrides', {});
    
    return ordersList
      .filter(o => !deletedIds.includes(o.id) && !deletedIds.includes(o.orderNumber))
      .map(o => {
        const ov = overrides[o.id] || overrides[o.orderNumber];
        if (ov) {
          return {
            ...o,
            orderStatus: ov.orderStatus || o.orderStatus,
            courierName: ov.courierName || o.courierName,
            trackingNumber: ov.trackingNumber !== undefined ? ov.trackingNumber : o.trackingNumber,
            updatedAt: ov.updatedAt || o.updatedAt,
          };
        }
        return o;
      });
  },

  getOrders: () => {
    const rawOrders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    return db.mergeOrderStatusOverrides(rawOrders);
  },

  getOrderByNumberAndPhone: (orderNumber: string, phone: string) => {
    const rawOrders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    const orders = db.mergeOrderStatusOverrides(rawOrders);
    const cleanNum = orderNumber ? orderNumber.trim().toUpperCase() : '';
    const normPhone = phone ? normalizePhoneDigits(phone) : '';

    return orders.find(o => {
      const matchNum = Boolean(cleanNum && (o.orderNumber.toUpperCase() === cleanNum || o.id === cleanNum));
      const oPhoneNorm = normalizePhoneDigits(o.customerPhone);
      const matchPhone = Boolean(normPhone && oPhoneNorm && (normPhone === oPhoneNorm || normPhone.includes(oPhoneNorm) || oPhoneNorm.includes(normPhone)));
      
      if (cleanNum && normPhone) {
        return matchNum && matchPhone;
      }
      return matchNum || matchPhone;
    });
  },

  createOrder: (orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const orders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    const customers = loadFromStorage<Customer[]>('fbs_customers', initialCustomers);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const timeMs = String(now.getTime()).slice(-4);
    const rand = Math.floor(10 + Math.random() * 90);
    const orderNumber = `FB${yyyy}${mm}${dd}-${timeMs}${rand}`;
    const orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const initialStatus = orderInput.orderStatus || 'PENDING_PAYMENT';
    
    const initialTimeline: OrderTimelineEvent[] = [
      {
        id: `tl-${Date.now()}`,
        orderId,
        status: initialStatus,
        title: 'Pesanan Diterima',
        description: 'Pesanan baru telah berhasil dibuat dan disimpan di database.',
        timestamp: new Date().toISOString(),
        updatedBy: 'Pelanggan'
      }
    ];

    const newOrder: Order = {
      ...orderInput,
      id: orderId,
      orderNumber,
      orderStatus: initialStatus,
      timeline: initialTimeline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    saveToStorage('fbs_orders', orders);

    // AUTO-INCREMENT TOTAL SOLD & DEDUCT VARIANT STOCK ON ORDER PLACED WITH STOCK HISTORY LOGGING
    try {
      const products = loadFromStorage<Product[]>('fbs_products', initialProducts);
      orderInput.items.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.productId || p.productName.toLowerCase() === item.productName.toLowerCase());
        if (pIdx !== -1) {
          products[pIdx].totalSold = (products[pIdx].totalSold || 0) + (item.quantity || 1);
          if (products[pIdx].variants) {
            const vIdx = products[pIdx].variants.findIndex(v => v.variantName === item.variantName);
            if (vIdx !== -1) {
              const newStock = Math.max(0, products[pIdx].variants[vIdx].stock - (item.quantity || 1));
              products[pIdx].variants[vIdx].stock = newStock;
              
              // Record Stock History Log
              db.recordStockLog({
                productId: products[pIdx].id,
                productName: products[pIdx].productName,
                variantName: item.variantName,
                changeType: 'ORDER_DEDUCT',
                quantityChange: -(item.quantity || 1),
                stockAfter: newStock,
                orderNumber,
              });
            }
          }
        }
      });
      saveToStorage('fbs_products', products);
    } catch (err) {
      console.error('Error auto-updating stock on createOrder:', err);
    }

    const cleanPhone = orderInput.customerPhone.replace(/[^0-9]/g, '');
    const existingCustIdx = customers.findIndex(c => c.phone.replace(/[^0-9]/g, '') === cleanPhone);

    if (existingCustIdx !== -1) {
      customers[existingCustIdx].name = orderInput.customerName;
      customers[existingCustIdx].address = orderInput.address;
      customers[existingCustIdx].city = orderInput.city;
      customers[existingCustIdx].state = orderInput.state;
      customers[existingCustIdx].postcode = orderInput.postcode;
    } else {
      customers.unshift({
        id: `cust-${Date.now()}`,
        name: orderInput.customerName,
        email: 'customer@fbsbakeryworld.com',
        phone: orderInput.customerPhone,
        customerType: 'RETAIL',
        address: orderInput.address,
        city: orderInput.city,
        state: orderInput.state,
        postcode: orderInput.postcode,
        createdAt: new Date().toISOString(),
      });
    }

    saveToStorage('fbs_customers', customers);

    if (typeof window !== 'undefined') {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(err => console.warn('Order server sync warning:', err));
    }

    return newOrder;
  },

  updateOrderStatus: (id: string, status: Order['orderStatus'], courierName?: string, trackingNumber?: string) => {
    return db.updateOrderStatusAndTracking(id, status, courierName, trackingNumber);
  },

  updateOrderStatusAndTracking: (id: string, status: Order['orderStatus'], courierName?: string, trackingNumber?: string) => {
    const orders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    const idx = orders.findIndex(o => o.id === id || o.orderNumber === id);

    if (idx !== -1) {
      const previousStatus = orders[idx].orderStatus;
      orders[idx].orderStatus = status;
      if (courierName) orders[idx].courierName = courierName;
      if (trackingNumber) orders[idx].trackingNumber = trackingNumber;
      if (status === 'SHIPPED') orders[idx].shippedAt = new Date().toISOString();
      // AUTO-RESTOCK VARIANT STOCK ON ORDER CANCELLATION
      if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        try {
          const products = loadFromStorage<Product[]>('fbs_products', initialProducts);
          orders[idx].items?.forEach((item: any) => {
            const pIdx = products.findIndex(p => p.id === item.productId || p.productName.toLowerCase() === item.productName.toLowerCase());
            if (pIdx !== -1) {
              products[pIdx].totalSold = Math.max(0, (products[pIdx].totalSold || 0) - (item.quantity || 1));
              if (products[pIdx].variants) {
                const vIdx = products[pIdx].variants!.findIndex(v => v.id === item.productVariantId || v.variantName.toLowerCase() === item.variantName.toLowerCase());
                if (vIdx !== -1) {
                  products[pIdx].variants![vIdx].stock += (item.quantity || 1);
                }
              }
            }
          });
          saveToStorage('fbs_products', products);
        } catch (restockErr) {
          console.error('Error auto-restocking in db.ts:', restockErr);
        }
      }

      if (!orders[idx].timeline) orders[idx].timeline = [];
      const getTitle = (st: string) => {
        switch (st) {
          case 'PENDING_PAYMENT': return 'Menunggu Pembayaran';
          case 'PAYMENT_VERIFIED': return 'Pembayaran Terverifikasi';
          case 'CONFIRMED': return 'Pesanan Dikonfirmasi';
          case 'PACKING': return 'Sedang Dikemas';
          case 'READY_TO_SHIP': return 'Siap Dikirim';
          case 'SHIPPING': return 'Dalam Pengiriman';
          case 'DELIVERED': return 'Pesanan Diterima';
          case 'COMPLETED': return 'Pesanan Selesai';
          case 'CANCEL_REQUESTED': return 'Permintaan Pembatalan';
          case 'CANCELLED': return 'Pesanan Dibatalkan';
          case 'REFUND': return 'Pengembalian Dana';
          default: return st;
        }
      };

      const getDesc = (st: string, cour?: string, resi?: string) => {
        switch (st) {
          case 'PENDING_PAYMENT': return 'Pesanan menunggu proses verifikasi pembayaran.';
          case 'PAYMENT_VERIFIED': return 'Pembayaran telah terverifikasi oleh Admin Toko.';
          case 'CONFIRMED': return 'Pesanan telah disetujui & dikonfirmasi oleh Admin Toko.';
          case 'PACKING': return 'Barang sedang diproses dan dikemas di gudang bakery.';
          case 'READY_TO_SHIP': return 'Paket disiapkan dan menunggu penjemputan oleh kurir.';
          case 'SHIPPING': return `Paket diserahkan ke ekspedisi ${cour || 'Kurir'}${resi ? ` (No. Resi: ${resi})` : ''}.`;
          case 'DELIVERED': return 'Paket telah berhasil diserahkan kepada penerima.';
          case 'COMPLETED': return 'Pesanan telah selesai diselesaikan oleh pelanggan.';
          case 'CANCEL_REQUESTED': return 'Pelanggan mengajukan permintaan pembatalan pesanan.';
          case 'CANCELLED': return 'Pesanan dibatalkan & stok dikembalikan ke inventaris.';
          case 'REFUND': return 'Dana pembayaran telah dikembalikan kepada pelanggan.';
          default: return 'Status pesanan diperbarui.';
        }
      };

      const finalCour = courierName || orders[idx].courierName;
      const finalResi = trackingNumber || orders[idx].trackingNumber;
      orders[idx].timeline.push({
        id: `tl-${Date.now()}`,
        orderId: orders[idx].id,
        status: status,
        title: getTitle(status),
        description: getDesc(status, finalCour, finalResi),
        timestamp: new Date().toISOString(),
        updatedBy: 'Admin Store'
      });
      
      const overrides = loadFromStorage<Record<string, any>>('fbs_order_status_overrides', {});
      const ovData = {
        orderStatus: status,
        courierName: orders[idx].courierName,
        trackingNumber: orders[idx].trackingNumber,
        updatedAt: orders[idx].updatedAt,
      };
      if (orders[idx].id) overrides[orders[idx].id] = ovData;
      if (orders[idx].orderNumber) overrides[orders[idx].orderNumber] = ovData;
      saveToStorage('fbs_order_status_overrides', overrides);
      
      // AUTO-RESTORE VARIANT STOCK IF ORDER IS CANCELLED WITH STOCK HISTORY LOGGING
      if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        try {
          const products = loadFromStorage<Product[]>('fbs_products', initialProducts);
          orders[idx].items.forEach(item => {
            const pIdx = products.findIndex(p => p.id === item.productId || p.productName.toLowerCase() === item.productName.toLowerCase());
            if (pIdx !== -1 && products[pIdx].variants) {
              const vIdx = products[pIdx].variants.findIndex(v => v.variantName === item.variantName);
              if (vIdx !== -1) {
                products[pIdx].variants[vIdx].stock += (item.quantity || 1);
                const restoredStock = products[pIdx].variants[vIdx].stock;

                // Record Stock History Log
                db.recordStockLog({
                  productId: products[pIdx].id,
                  productName: products[pIdx].productName,
                  variantName: item.variantName,
                  changeType: 'CANCEL_RESTORE',
                  quantityChange: +(item.quantity || 1),
                  stockAfter: restoredStock,
                  orderNumber: orders[idx].orderNumber,
                });
              }
            }
          });
          saveToStorage('fbs_products', products);
        } catch (err) {
          console.error('Error restoring stock on order cancel:', err);
        }
      }

      saveToStorage('fbs_orders', orders);

      if (typeof window !== 'undefined') {
        fetch('/api/orders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: orders[idx].id,
            orderNumber: orders[idx].orderNumber,
            orderStatus: status,
            courierName: courierName || orders[idx].courierName,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : orders[idx].trackingNumber,
            updatedBy: 'Admin Store',
          }),
        }).catch(err => console.warn('Order status sync warning:', err));
      }

      return orders[idx];
    }
    return null;
  },

  deleteOrder: (id: string) => {
    const deletedIds = loadFromStorage<string[]>('fbs_deleted_order_ids', []);
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      saveToStorage('fbs_deleted_order_ids', deletedIds);
    }

    let orders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    const targetOrder = orders.find(o => o.id === id || o.orderNumber === id);
    if (targetOrder) {
      if (!deletedIds.includes(targetOrder.id)) deletedIds.push(targetOrder.id);
      if (!deletedIds.includes(targetOrder.orderNumber)) deletedIds.push(targetOrder.orderNumber);
      saveToStorage('fbs_deleted_order_ids', deletedIds);
    }

    orders = orders.filter(o => o.id !== id && o.orderNumber !== id);
    saveToStorage('fbs_orders', orders);

    if (typeof window !== 'undefined') {
      fetch(`/api/orders?deleteId=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }).catch(err => console.warn('Order delete sync warning:', err));
    }
    return true;
  },

  // Stock History Logs API
  getStockLogs: (): StockHistoryLog[] => {
    return loadFromStorage<StockHistoryLog[]>('fbs_stock_logs', []);
  },

  recordStockLog: (log: Omit<StockHistoryLog, 'id' | 'timestamp'>): StockHistoryLog => {
    const logs = loadFromStorage<StockHistoryLog[]>('fbs_stock_logs', []);
    const newLog: StockHistoryLog = {
      ...log,
      id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    saveToStorage('fbs_stock_logs', logs.slice(0, 200));
    return newLog;
  },

  // Customer Database CRM
  getCustomers: (): Customer[] => {
    return loadFromStorage<Customer[]>('fbs_customers', initialCustomers);
  },

  saveCustomer: (customerInput: Partial<Customer>): Customer => {
    const list = loadFromStorage<Customer[]>('fbs_customers', initialCustomers);
    let target: Customer;

    if (customerInput.id) {
      const idx = list.findIndex(c => c.id === customerInput.id || (customerInput.email && c.email && c.email.toLowerCase() === customerInput.email.toLowerCase()));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...customerInput };
        target = list[idx];
      } else {
        target = {
          id: customerInput.id,
          name: customerInput.name || 'Pelanggan FBS',
          email: customerInput.email || '',
          phone: customerInput.phone || '',
          customerType: customerInput.customerType || 'RETAIL',
          provider: customerInput.provider || 'FORM',
          address: customerInput.address || 'Chukai, Terengganu',
          city: customerInput.city || 'Chukai',
          state: customerInput.state || 'Terengganu',
          postcode: customerInput.postcode || '24000',
          createdAt: customerInput.createdAt || new Date().toISOString(),
          loginAt: customerInput.loginAt || new Date().toISOString(),
          ...customerInput
        };
        list.unshift(target);
      }
    } else {
      target = {
        id: `cust-${Date.now()}`,
        name: customerInput.name || 'Pelanggan FBS',
        email: customerInput.email || '',
        phone: customerInput.phone || '',
        customerType: customerInput.customerType || 'RETAIL',
        provider: customerInput.provider || 'FORM',
        address: customerInput.address || 'Chukai, Terengganu',
        city: customerInput.city || 'Chukai',
        state: customerInput.state || 'Terengganu',
        postcode: customerInput.postcode || '24000',
        createdAt: customerInput.createdAt || new Date().toISOString(),
        loginAt: customerInput.loginAt || new Date().toISOString(),
        ...customerInput
      };
      list.unshift(target);
    }

    saveToStorage('fbs_customers', list);

    if (typeof window !== 'undefined') {
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target),
      }).catch(err => console.warn('Customer server sync warning:', err));
    }

    return target;
  },

  // Banners & Banner Builder API
  getBanners: (): Banner[] => {
    return loadFromStorage<Banner[]>('fbs_banners', initialBanners);
  },

  saveAllBanners: (newBanners: Banner[]) => {
    saveToStorage('fbs_banners', newBanners);
    return newBanners;
  },

  saveBanner: (bannerInput: Partial<Banner>): Banner => {
    const banners = loadFromStorage<Banner[]>('fbs_banners', initialBanners);
    if (bannerInput.id) {
      const idx = banners.findIndex(b => b.id === bannerInput.id);
      if (idx !== -1) {
        banners[idx] = { ...banners[idx], ...bannerInput };
        saveToStorage('fbs_banners', banners);
        return banners[idx];
      }
    }
    const newBan: Banner = {
      id: `ban-${Date.now()}`,
      title: bannerInput.title || 'New Promo Banner',
      subtitle: bannerInput.subtitle || 'Special baking supply offer',
      imageUrl: bannerInput.imageUrl || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop',
      buttonText: bannerInput.buttonText || 'SHOP NOW',
      buttonLink: bannerInput.buttonLink || '/products',
      status: bannerInput.status ?? true,
      videoUrl: bannerInput.videoUrl || '',
    };
    banners.unshift(newBan);
    saveToStorage('fbs_banners', banners);
    return newBan;
  },

  deleteBanner: (id: string) => {
    let banners = loadFromStorage<Banner[]>('fbs_banners', initialBanners);
    banners = banners.filter(b => b.id !== id);
    saveToStorage('fbs_banners', banners);
    return true;
  },

  toggleBannerStatus: (id: string) => {
    const banners = loadFromStorage<Banner[]>('fbs_banners', initialBanners);
    const idx = banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      banners[idx].status = !banners[idx].status;
      saveToStorage('fbs_banners', banners);
      return banners[idx];
    }
    return null;
  },

  // Blogs
  getBlogs: (): Blog[] => {
    return loadFromStorage<Blog[]>('fbs_blogs', initialBlogs);
  },

  getBlogBySlug: (slug: string) => {
    const list = loadFromStorage<Blog[]>('fbs_blogs', initialBlogs);
    return list.find(b => b.slug === slug || b.id === slug);
  },

  saveBlog: (blogInput: Partial<Blog>): Blog => {
    const blogs = loadFromStorage<Blog[]>('fbs_blogs', initialBlogs);
    if (blogInput.id) {
      const idx = blogs.findIndex(b => b.id === blogInput.id);
      if (idx !== -1) {
        blogs[idx] = { ...blogs[idx], ...blogInput };
        saveToStorage('fbs_blogs', blogs);
        return blogs[idx];
      }
    }
    const newBlog: Blog = {
      id: `blog-${Date.now()}`,
      type: blogInput.type || 'ARTICLE',
      title: blogInput.title || 'New Update Post',
      slug: (blogInput.title || 'new-update-post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      excerpt: blogInput.excerpt || '',
      content: blogInput.content || '',
      image: blogInput.image || 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
      contentBlocks: blogInput.contentBlocks || [],
      galleryImages: blogInput.galleryImages || [],
      embedUrl: blogInput.embedUrl || '',
      videoThumbnail: blogInput.videoThumbnail || '',
      author: blogInput.author || 'FBS Team',
      tags: blogInput.tags || [],
      createdAt: new Date().toISOString(),
    };
    blogs.unshift(newBlog);
    saveToStorage('fbs_blogs', blogs);
    return newBlog;
  },

  deleteBlog: (id: string) => {
    let blogs = loadFromStorage<Blog[]>('fbs_blogs', initialBlogs);
    blogs = blogs.filter(b => b.id !== id);
    saveToStorage('fbs_blogs', blogs);
    return true;
  },

  // Videos
  getVideos: (): VideoPost[] => {
    const list = loadFromStorage<VideoPost[]>('fbs_videos', initialVideos);
    let hasCorruptedEntry = false;

    // Sanitize any legacy corrupted entries with single letter titles (e.g. "V")
    const sanitizedList = list.map(v => {
      if (v.title === 'V' || !v.title || v.title.trim().length <= 1) {
        hasCorruptedEntry = true;
        return {
          ...v,
          title: 'NEW MENU CAKE : ICEBERG CHEESE CAKE 🍰',
        };
      }
      return v;
    });

    // If corrupted entry was detected, overwrite localStorage permanently so it never reverts on refresh
    if (hasCorruptedEntry) {
      saveToStorage('fbs_videos', sanitizedList);
    }

    return sanitizedList;
  },

  getVideoById: (id: string) => {
    const list = loadFromStorage<VideoPost[]>('fbs_videos', initialVideos);
    return list.find(v => v.id === id);
  },

  saveVideo: (videoInput: Partial<VideoPost>): VideoPost => {
    const list = loadFromStorage<VideoPost[]>('fbs_videos', initialVideos);
    if (videoInput.id) {
      const idx = list.findIndex(v => v.id === videoInput.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...videoInput };
        saveToStorage('fbs_videos', list);
        return list[idx];
      }
    }
    const newVideo: VideoPost = {
      id: `vid-${Date.now()}`,
      title: videoInput.title || 'New Video Post',
      description: videoInput.description || '',
      platform: videoInput.platform || 'YOUTUBE',
      embedUrl: videoInput.embedUrl || '',
      thumbnail: videoInput.thumbnail || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
      duration: videoInput.duration || '05:00',
      category: videoInput.category || 'General',
      status: videoInput.status || 'PUBLISHED',
      isFeatured: videoInput.isFeatured ?? false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newVideo);
    saveToStorage('fbs_videos', list);
    return newVideo;
  },

  deleteVideo: (id: string) => {
    let list = loadFromStorage<VideoPost[]>('fbs_videos', initialVideos);
    list = list.filter(v => v.id !== id);
    saveToStorage('fbs_videos', list);
    return true;
  },

  // Categories CRUD
  getCategories: (): Category[] => {
    const list = loadFromStorage<Category[]>('fbs_categories', categoriesData);
    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  getCategoryBySlug: (slug: string) => {
    const list = loadFromStorage<Category[]>('fbs_categories', categoriesData);
    return list.find(c => c.slug === slug || c.id === slug);
  },

  saveCategory: (categoryInput: Partial<Category>): Category => {
    const list = loadFromStorage<Category[]>('fbs_categories', categoriesData);
    if (categoryInput.id) {
      const idx = list.findIndex(c => c.id === categoryInput.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...categoryInput };
        saveToStorage('fbs_categories', list);
        return list[idx];
      }
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: categoryInput.name || 'New Category',
      slug: (categoryInput.name || 'new-category').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: categoryInput.description || '',
      image: categoryInput.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      sortOrder: categoryInput.sortOrder || list.length + 1,
    };
    list.push(newCat);
    saveToStorage('fbs_categories', list);
    return newCat;
  },

  deleteCategory: (id: string) => {
    let list = loadFromStorage<Category[]>('fbs_categories', categoriesData);
    list = list.filter(c => c.id !== id);
    saveToStorage('fbs_categories', list);

    // Clean up orphaned products linked to the deleted category
    let products = loadFromStorage<Product[]>('fbs_products', initialProducts);
    let updated = false;
    products = products.map(p => {
      if (p.categoryId === id) {
        updated = true;
        return {
          ...p,
          categoryId: 'cat-1',
          categoryName: 'Flour & Powder',
        };
      }
      return p;
    });
    if (updated) {
      saveToStorage('fbs_products', products);
    }

    return true;
  },

  // Recipes CRUD with Video Upload Support
  getRecipes: (): Recipe[] => {
    return loadFromStorage<Recipe[]>('fbs_recipes', recipesData);
  },

  getRecipeBySlug: (slug: string) => {
    const list = loadFromStorage<Recipe[]>('fbs_recipes', recipesData);
    return list.find(r => r.slug === slug || r.id === slug);
  },

  saveRecipe: (recipeInput: Partial<Recipe>): Recipe => {
    const recipes = loadFromStorage<Recipe[]>('fbs_recipes', recipesData);
    if (recipeInput.id) {
      const idx = recipes.findIndex(r => r.id === recipeInput.id);
      if (idx !== -1) {
        recipes[idx] = { ...recipes[idx], ...recipeInput };
        saveToStorage('fbs_recipes', recipes);
        return recipes[idx];
      }
    }
    const newRecipe: Recipe = {
      id: `rec-${Date.now()}`,
      title: recipeInput.title || 'New Baking Recipe',
      slug: (recipeInput.title || 'new-baking-recipe').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      coverImage: recipeInput.coverImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
      videoUrl: recipeInput.videoUrl || '',
      description: recipeInput.description || '',
      ingredients: recipeInput.ingredients || ['100g Flour', '50g Sugar'],
      instructions: recipeInput.instructions || ['Mix ingredients', 'Bake at 180°C for 25 mins'],
      difficulty: recipeInput.difficulty || 'Medium',
      cookingTime: recipeInput.cookingTime || 30,
      relatedProductIds: recipeInput.relatedProductIds || ['prod-1'],
      createdAt: new Date().toISOString(),
    };
    recipes.unshift(newRecipe);
    saveToStorage('fbs_recipes', recipes);
    return newRecipe;
  },

  deleteRecipe: (id: string) => {
    let recipes = loadFromStorage<Recipe[]>('fbs_recipes', recipesData);
    recipes = recipes.filter(r => r.id !== id);
    saveToStorage('fbs_recipes', recipes);
    return true;
  },

  // Store Settings with persistent localStorage sync
  getStoreSettings: (): StoreSetting => {
    const res = loadFromStorage<StoreSetting>('fbs_store_settings', storeSettingData);
    const fallbackUrl = storeSettingData.googleMapsEmbedUrl || '';
    const savedUrl = res?.googleMapsEmbedUrl;
    let embedUrl = (typeof savedUrl === 'string' && savedUrl.trim() !== '') ? savedUrl : fallbackUrl;
    
    // If stored embedUrl is the old default Kuala Lumpur / Shah Alam map URL, update to Chukai Terengganu
    if (embedUrl && (embedUrl.includes('Kuala%20Lumpur') || embedUrl.includes('0x31cc362807480d39') || embedUrl.includes('101.686855') || embedUrl.includes('Shah%20Alam'))) {
      embedUrl = fallbackUrl;
    }

    let address = res?.address || storeSettingData.address;
    if (address && address.includes('Shah Alam')) {
      address = storeSettingData.address;
    }

    return {
      ...storeSettingData,
      stockThreshold: typeof res?.stockThreshold === 'number' ? res.stockThreshold : 10,
      ...res,
      address,
      companyRegistrationName: res?.companyRegistrationName || storeSettingData.companyRegistrationName,
      operatingHours: res?.operatingHours || storeSettingData.operatingHours,
      googleMapsEmbedUrl: embedUrl,
      googleMapsAppUrl: (res?.googleMapsAppUrl && res.googleMapsAppUrl.trim()) ? res.googleMapsAppUrl : storeSettingData.googleMapsAppUrl,
    };
  },

  updateStoreSettings: (newSettings: Partial<StoreSetting>) => {
    const current = loadFromStorage<StoreSetting>('fbs_store_settings', storeSettingData);
    const updated = { ...current, ...newSettings };
    saveToStorage('fbs_store_settings', updated);
    return updated;
  },

  // About Us CMS Settings
  getAboutSettings: (): AboutSetting => {
    return loadFromStorage<AboutSetting>('fbs_about_settings', aboutSettingData);
  },

  updateAboutSettings: (newSettings: Partial<AboutSetting>) => {
    const current = loadFromStorage<AboutSetting>('fbs_about_settings', aboutSettingData);
    const updated = { ...current, ...newSettings };
    saveToStorage('fbs_about_settings', updated);
    return updated;
  },

  // Home Page CMS Settings
  getHomePageSettings: (): HomePageSetting => {
    return loadFromStorage<HomePageSetting>('fbs_homepage_settings', homePageSettingData);
  },

  updateHomePageSettings: (newSettings: Partial<HomePageSetting>) => {
    const current = loadFromStorage<HomePageSetting>('fbs_homepage_settings', homePageSettingData);
    const updated = { ...current, ...newSettings };
    saveToStorage('fbs_homepage_settings', updated);
    return updated;
  },

  // Admin Credentials Manager
  getAdminCredentials: (): AdminCredentialSetting => {
    return loadFromStorage<AdminCredentialSetting>('fbs_admin_credentials', adminCredentialData);
  },

  updateAdminCredentials: (newCreds: Partial<AdminCredentialSetting>) => {
    const current = loadFromStorage<AdminCredentialSetting>('fbs_admin_credentials', adminCredentialData);
    const updated = { ...current, ...newCreds };
    saveToStorage('fbs_admin_credentials', updated);
    return updated;
  },

  // Customer Product Reviews & Video Feedback
  getProductReviews: (productId: string) => {
    let all = loadFromStorage<ProductReview[]>('fbs_product_reviews', initialReviewsData);
    if (all.some(r => ['rev-1', 'rev-2', 'rev-3'].includes(r.id))) {
      all = all.filter(r => !['rev-1', 'rev-2', 'rev-3'].includes(r.id));
      saveToStorage('fbs_product_reviews', all);
    }
    return all.filter(r => r.productId === productId);
  },

  addReview: (review: Omit<ProductReview, 'id' | 'createdAt'>): ProductReview => {
    let all = loadFromStorage<ProductReview[]>('fbs_product_reviews', initialReviewsData);
    if (all.some(r => ['rev-1', 'rev-2', 'rev-3'].includes(r.id))) {
      all = all.filter(r => !['rev-1', 'rev-2', 'rev-3'].includes(r.id));
    }
    const newRev: ProductReview = {
      ...review,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newRev);
    saveToStorage('fbs_product_reviews', all);
    return newRev;
  },

  calculateProductRating: (productId: string) => {
    let reviews = loadFromStorage<ProductReview[]>('fbs_product_reviews', initialReviewsData);
    if (reviews.some(r => ['rev-1', 'rev-2', 'rev-3'].includes(r.id))) {
      reviews = reviews.filter(r => !['rev-1', 'rev-2', 'rev-3'].includes(r.id));
      saveToStorage('fbs_product_reviews', reviews);
    }
    const filtered = reviews.filter(r => r.productId === productId);
    if (filtered.length === 0) {
      return { averageRating: 0.0, reviewCount: 0 };
    }
    const sum = filtered.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / filtered.length;
    return {
      averageRating: parseFloat(avg.toFixed(1)),
      reviewCount: filtered.length,
    };
  },

  // Shipping Management API
  getCouriers: (): ShippingCourier[] => {
    return loadFromStorage<ShippingCourier[]>('fbs_shipping_couriers', initialCouriers);
  },

  saveCourier: (courier: Partial<ShippingCourier>): ShippingCourier => {
    const list = loadFromStorage<ShippingCourier[]>('fbs_shipping_couriers', initialCouriers);
    if (courier.id) {
      const idx = list.findIndex(c => c.id === courier.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...courier };
        saveToStorage('fbs_shipping_couriers', list);
        return list[idx];
      }
    }
    const newCourier: ShippingCourier = {
      id: `cour-${Date.now()}`,
      name: courier.name || 'New Courier',
      code: (courier.code || 'COURIER').toUpperCase(),
      logo: courier.logo || '🚚',
      status: courier.status ?? true,
      sortOrder: courier.sortOrder || list.length + 1,
    };
    list.push(newCourier);
    saveToStorage('fbs_shipping_couriers', list);
    return newCourier;
  },

  toggleCourierStatus: (id: string) => {
    const list = loadFromStorage<ShippingCourier[]>('fbs_shipping_couriers', initialCouriers);
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].status = !list[idx].status;
      saveToStorage('fbs_shipping_couriers', list);
      return list[idx];
    }
    return null;
  },

  deleteCourier: (id: string) => {
    let list = loadFromStorage<ShippingCourier[]>('fbs_shipping_couriers', initialCouriers);
    list = list.filter(c => c.id !== id);
    saveToStorage('fbs_shipping_couriers', list);
    return true;
  },

  getShippingStates: (): ShippingState[] => {
    return loadFromStorage<ShippingState[]>('fbs_shipping_states', initialShippingStates);
  },

  saveShippingState: (stateInput: Partial<ShippingState>): ShippingState => {
    const list = loadFromStorage<ShippingState[]>('fbs_shipping_states', initialShippingStates);
    if (stateInput.id) {
      const idx = list.findIndex(s => s.id === stateInput.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...stateInput };
        saveToStorage('fbs_shipping_states', list);
        return list[idx];
      }
    }
    const newState: ShippingState = {
      id: `st-${Date.now()}`,
      name: stateInput.name || 'State Name',
      code: (stateInput.code || 'STATE').toUpperCase(),
      region: stateInput.region || 'PENINSULAR',
      status: stateInput.status ?? true,
    };
    list.push(newState);
    saveToStorage('fbs_shipping_states', list);
    return newState;
  },

  toggleStateStatus: (id: string) => {
    const list = loadFromStorage<ShippingState[]>('fbs_shipping_states', initialShippingStates);
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx].status = !list[idx].status;
      saveToStorage('fbs_shipping_states', list);
      return list[idx];
    }
    return null;
  },

  deleteShippingState: (id: string) => {
    let list = loadFromStorage<ShippingState[]>('fbs_shipping_states', initialShippingStates);
    list = list.filter(s => s.id !== id);
    saveToStorage('fbs_shipping_states', list);
    return true;
  },

  getWeightBrackets: (): WeightBracket[] => {
    return loadFromStorage<WeightBracket[]>('fbs_weight_brackets', initialWeightBrackets);
  },

  saveWeightBracket: (bracketInput: Partial<WeightBracket>): WeightBracket => {
    const list = loadFromStorage<WeightBracket[]>('fbs_weight_brackets', initialWeightBrackets);
    if (bracketInput.id) {
      const idx = list.findIndex(w => w.id === bracketInput.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...bracketInput };
        saveToStorage('fbs_weight_brackets', list);
        return list[idx];
      }
    }
    const newBracket: WeightBracket = {
      id: `wb-${Date.now()}`,
      name: bracketInput.name || '0 - 1 kg',
      minWeightGrams: bracketInput.minWeightGrams || 0,
      maxWeightGrams: bracketInput.maxWeightGrams || 1000,
      sortOrder: bracketInput.sortOrder || list.length + 1,
    };
    list.push(newBracket);
    list.sort((a, b) => a.minWeightGrams - b.minWeightGrams);
    saveToStorage('fbs_weight_brackets', list);
    return newBracket;
  },

  deleteWeightBracket: (id: string) => {
    let list = loadFromStorage<WeightBracket[]>('fbs_weight_brackets', initialWeightBrackets);
    list = list.filter(w => w.id !== id);
    saveToStorage('fbs_weight_brackets', list);
    return true;
  },

  getShippingRates: (): ShippingRate[] => {
    return loadFromStorage<ShippingRate[]>('fbs_shipping_rates', initialShippingRates);
  },

  saveShippingRate: (rateInput: Partial<ShippingRate>): ShippingRate => {
    const list = loadFromStorage<ShippingRate[]>('fbs_shipping_rates', initialShippingRates);
    const idx = list.findIndex(
      r => r.courierId === rateInput.courierId && r.stateCode === rateInput.stateCode && r.weightBracketId === rateInput.weightBracketId
    );
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...rateInput };
      saveToStorage('fbs_shipping_rates', list);
      return list[idx];
    }
    const newRate: ShippingRate = {
      id: `sr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      courierId: rateInput.courierId || '',
      stateCode: rateInput.stateCode || 'PENINSULAR',
      weightBracketId: rateInput.weightBracketId || '',
      price: rateInput.price || 0,
    };
    list.push(newRate);
    saveToStorage('fbs_shipping_rates', list);
    return newRate;
  },

  calculateShippingFee: (courierId: string, stateNameOrCode: string, weightGrams: number): { fee: number; bracketName: string; region: string } => {
    const couriers = db.getCouriers();
    const states = db.getShippingStates();
    const brackets = db.getWeightBrackets();
    const rates = db.getShippingRates();

    const currentCourier = couriers.find(c => c.id === courierId || c.code === courierId || c.name.toLowerCase() === courierId.toLowerCase());
    const targetCourierId = currentCourier ? currentCourier.id : (couriers[0]?.id || '');

    const targetState = states.find(s => s.name.toLowerCase() === stateNameOrCode.toLowerCase() || s.code.toLowerCase() === stateNameOrCode.toLowerCase());
    const region = targetState ? targetState.region : (['Sabah', 'Sarawak', 'Labuan'].some(s => stateNameOrCode.toLowerCase().includes(s.toLowerCase())) ? 'EAST_MALAYSIA' : 'PENINSULAR');
    const stateCode = targetState ? targetState.code : region;

    // Match weight bracket
    const cleanWeight = Math.max(0, weightGrams);
    let matchedBracket = brackets.find(b => cleanWeight >= b.minWeightGrams && cleanWeight <= b.maxWeightGrams);
    if (!matchedBracket && brackets.length > 0) {
      // If weight exceeds max bracket, take the highest bracket
      matchedBracket = brackets[brackets.length - 1];
    }
    const bracketId = matchedBracket ? matchedBracket.id : '';

    // Match rate
    let matchedRate = rates.find(r => r.courierId === targetCourierId && (r.stateCode === stateCode || r.stateCode === region) && r.weightBracketId === bracketId);

    if (!matchedRate) {
      matchedRate = rates.find(r => r.courierId === targetCourierId && r.stateCode === region && r.weightBracketId === bracketId);
    }

    const fallbackRate = region === 'EAST_MALAYSIA' ? 16.00 : 8.00;
    const fee = matchedRate ? matchedRate.price : fallbackRate;

    return {
      fee,
      bracketName: matchedBracket ? matchedBracket.name : 'Standar',
      region: region === 'EAST_MALAYSIA' ? 'Malaysia Timur' : 'Semenanjung',
    };
  },

  // Product Share Analytics API
  recordProductShare: (productId: string, productName: string, platform: ProductShareLog['platform']): ProductShareLog => {
    const list = loadFromStorage<ProductShareLog[]>('fbs_share_analytics', []);
    const newLog: ProductShareLog = {
      id: `share-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId,
      productName,
      platform,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newLog);
    saveToStorage('fbs_share_analytics', list);
    return newLog;
  },

  getShareAnalytics: (productId?: string) => {
    const list = loadFromStorage<ProductShareLog[]>('fbs_share_analytics', []);
    const filtered = productId ? list.filter(l => l.productId === productId) : list;

    const total = filtered.length;
    const whatsapp = filtered.filter(l => l.platform === 'WHATSAPP').length;
    const facebook = filtered.filter(l => l.platform === 'FACEBOOK').length;
    const telegram = filtered.filter(l => l.platform === 'TELEGRAM').length;
    const copyLink = filtered.filter(l => l.platform === 'COPY_LINK').length;
    const nativeShare = filtered.filter(l => l.platform === 'NATIVE_SHARE').length;
    const qrCode = filtered.filter(l => l.platform === 'QR_CODE').length;

    return {
      total,
      whatsapp,
      facebook,
      telegram,
      copyLink,
      nativeShare,
      qrCode,
      logs: filtered,
    };
  },

  // Inventory Alert System API
  getStockThreshold: (): number => {
    const settings = db.getStoreSettings();
    const val = settings.stockThreshold;
    return typeof val === 'number' && val > 0 ? val : 10;
  },

  getProductTotalStock: (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (typeof v.stock === 'number' ? v.stock : 0), 0);
    }
    return typeof (product as any).stock === 'number' ? (product as any).stock : 0;
  },

  getProductStockStatus: (product: Product, customThreshold?: number): {
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    label: string;
    badgeBg: string;
    badgeText: string;
    totalStock: number;
    threshold: number;
  } => {
    const thresh = customThreshold !== undefined ? customThreshold : db.getStockThreshold();
    const totalStock = db.getProductTotalStock(product);
    if (totalStock === 0) {
      return {
        status: 'OUT_OF_STOCK',
        label: 'OUT OF STOCK',
        badgeBg: 'bg-red-600',
        badgeText: 'text-white font-bold',
        totalStock,
        threshold: thresh,
      };
    }
    if (totalStock <= thresh) {
      return {
        status: 'LOW_STOCK',
        label: 'LOW STOCK',
        badgeBg: 'bg-amber-500',
        badgeText: 'text-stone-950 font-black',
        totalStock,
        threshold: thresh,
      };
    }
    return {
      status: 'IN_STOCK',
      label: 'IN STOCK',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white font-bold',
      totalStock,
      threshold: thresh,
    };
  },

  getInventoryAlertSummary: (customThreshold?: number) => {
    const products = db.getProducts();
    const thresh = customThreshold !== undefined ? customThreshold : db.getStockThreshold();

    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const alertProducts = products.map(p => {
      const info = db.getProductStockStatus(p, thresh);
      if (info.status === 'IN_STOCK') inStockCount++;
      else if (info.status === 'LOW_STOCK') lowStockCount++;
      else if (info.status === 'OUT_OF_STOCK') outOfStockCount++;

      return {
        product: p,
        sku: p.sku || (p.variants?.[0]?.sku) || 'SKU-N/A',
        currentStock: info.totalStock,
        threshold: thresh,
        status: info.status,
        statusLabel: info.label,
        lastUpdated: (p as any).updatedAt || p.createdAt || new Date().toISOString(),
      };
    });

    return {
      totalProducts: products.length,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      products: alertProducts,
    };
  }
};
