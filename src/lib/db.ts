import { Product, Category, Order, Recipe, Blog, Banner, StoreSetting, Customer, Voucher, AboutSetting, HomePageSetting, AdminCredentialSetting, ProductReview, VideoPost } from '@/types';

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

let initialProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'FBS-FLR-001',
    productName: 'Semolina Flour Premium Grade',
    slug: 'semolina-flour-premium-grade',
    categoryId: 'cat-1',
    categoryName: 'Flour & Powder',
    brand: 'FBS Choice',
    shortDescription: 'Premium durum wheat semolina flour suitable for bread, pasta, and traditional baking.',
    description: 'FBS Premium Semolina Flour is milled from 100% pure high-protein durum wheat. It yields a rich golden color, ideal texture for artisan breads, pasta doughs, cakes, and traditional Mediterranean & Middle Eastern pastries.',
    mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: true,
    isBestSeller: true,
    status: true,
    totalSold: 1420,
    variants: [
      { id: 'var-1-1', productId: 'prod-1', variantName: '500g', weight: 0.5, price: 8.50, sku: 'FBS-FLR-001-500G', stock: 150 },
      { id: 'var-1-2', productId: 'prod-1', variantName: '1kg', weight: 1.0, price: 15.00, sku: 'FBS-FLR-001-1KG', stock: 200 },
      { id: 'var-1-3', productId: 'prod-1', variantName: '5kg Commercial', weight: 5.0, price: 65.00, sku: 'FBS-FLR-001-5KG', stock: 45 },
      { id: 'var-1-4', productId: 'prod-1', variantName: '25kg Wholesale Bag', weight: 25.0, price: 280.00, sku: 'FBS-FLR-001-25KG', stock: 15 },
    ],
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: 'prod-2',
    sku: 'FBS-MCH-002',
    productName: 'Uji Matcha Powder Grade A (Kyoto Import)',
    slug: 'uji-matcha-powder-grade-a',
    categoryId: 'cat-1',
    categoryName: 'Flour & Powder',
    brand: 'Kuriano Japan',
    shortDescription: '100% authentic ceremonial & culinary grade Japanese green tea powder.',
    description: 'Imported directly from Uji, Kyoto. Vibrant emerald green powder ground from shade-grown first-harvest tea leaves. Perfect for matcha lattes, cake batters, rolls, frosting, and dessert decorations.',
    mainImage: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: true,
    isBestSeller: true,
    status: true,
    totalSold: 850,
    variants: [
      { id: 'var-2-1', productId: 'prod-2', variantName: '100g Pack', weight: 0.1, price: 32.00, sku: 'FBS-MCH-002-100G', stock: 80 },
      { id: 'var-2-2', productId: 'prod-2', variantName: '250g Pack', weight: 0.25, price: 75.00, sku: 'FBS-MCH-002-250G', stock: 50 },
      { id: 'var-2-3', productId: 'prod-2', variantName: '1kg Bakery Pack', weight: 1.0, price: 270.00, sku: 'FBS-MCH-002-1KG', stock: 20 },
    ],
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-07-22T09:30:00Z',
  },
  {
    id: 'prod-3',
    sku: 'FBS-CHO-003',
    productName: 'Belgian Dark Chocolate Chips 70%',
    slug: 'belgian-dark-chocolate-chips-70',
    categoryId: 'cat-2',
    categoryName: 'Chocolate & Cocoa',
    brand: 'Callebaut Supreme',
    shortDescription: 'Rich 70% cocoa solid couverture chocolate chips for melting, baking & ganache.',
    description: 'Crafted in Belgium from sustainably sourced cocoa beans. Balanced bitter-sweet profile with intense cocoa aroma and silky melt-in-mouth texture. Holds shape beautifully in cookies and melts effortlessly for glazes.',
    mainImage: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: true,
    isBestSeller: true,
    status: true,
    totalSold: 2100,
    variants: [
      { id: 'var-3-1', productId: 'prod-3', variantName: '250g', weight: 0.25, price: 18.00, sku: 'FBS-CHO-003-250G', stock: 120 },
      { id: 'var-3-2', productId: 'prod-3', variantName: '1kg Pack', weight: 1.0, price: 62.00, sku: 'FBS-CHO-003-1KG', stock: 90 },
      { id: 'var-3-3', productId: 'prod-3', variantName: '5kg Bulk Box', weight: 5.0, price: 285.00, sku: 'FBS-CHO-003-5KG', stock: 25 },
    ],
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-07-25T11:00:00Z',
  },
  {
    id: 'prod-4',
    sku: 'FBS-ING-004',
    productName: 'Anchor Pure New Zealand Unsalted Butter',
    slug: 'anchor-pure-new-zealand-unsalted-butter',
    categoryId: 'cat-3',
    categoryName: 'Baking Ingredients',
    brand: 'Anchor',
    shortDescription: '100% natural grass-fed New Zealand cream butter for pastry and cakes.',
    description: 'Rich, golden butter made from pasture-raised New Zealand cows milk. Free from artificial colors or preservatives. Gives croissants, pie crusts, and buttercreams superior flavor and aroma.',
    mainImage: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: true,
    isBestSeller: true,
    status: true,
    variants: [
      { id: 'var-4-1', productId: 'prod-4', variantName: '227g Block', weight: 0.227, price: 14.50, sku: 'FBS-ING-004-227G', stock: 140 },
      { id: 'var-4-2', productId: 'prod-4', variantName: '1kg Block', weight: 1.0, price: 52.00, sku: 'FBS-ING-004-1KG', stock: 65 },
      { id: 'var-4-3', productId: 'prod-4', variantName: '5kg Carton', weight: 5.0, price: 240.00, sku: 'FBS-ING-004-5KG', stock: 18 },
    ],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-07-26T14:00:00Z',
  },
  {
    id: 'prod-5',
    sku: 'FBS-DEC-005',
    productName: 'Luxury 24K Edible Gold Leaf Flakes & Topper Set',
    slug: 'luxury-24k-edible-gold-leaf-flakes',
    categoryId: 'cat-4',
    categoryName: 'Cake Decoration',
    brand: 'DecorLuxe',
    shortDescription: 'Food grade 24K genuine gold leaf flakes for cake gilding and luxury desserts.',
    description: 'Transform wedding cakes, macarons, chocolates, and cocktails into royal masterpieces. 100% edible certified gold leaf flakes in protective glass jar along with acrylic birthday & celebration toppers.',
    mainImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: true,
    isBestSeller: false,
    status: true,
    variants: [
      { id: 'var-5-1', productId: 'prod-5', variantName: '1 Jar + Topper Set', weight: 0.1, price: 25.00, sku: 'FBS-DEC-005-SET', stock: 60 },
      { id: 'var-5-2', productId: 'prod-5', variantName: 'Bundle of 5 Sets', weight: 0.5, price: 110.00, sku: 'FBS-DEC-005-BUNDLE', stock: 25 },
    ],
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-07-27T08:00:00Z',
  },
  {
    id: 'prod-6',
    sku: 'FBS-TOL-006',
    productName: 'Professional Heavy-Duty Stand Mixer 7L',
    slug: 'professional-heavy-duty-stand-mixer-7l',
    categoryId: 'cat-5',
    categoryName: 'Baking Tools',
    brand: 'FBS Pro Equipment',
    shortDescription: '1200W pure copper motor commercial stand mixer with stainless steel bowl.',
    description: 'Built for home bakeries and commercial pastry shops. Features planetary mixing action, 6-speed speed control, splash guard, dough hook, wire whisk, and flat beater attachments.',
    mainImage: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: true,
    isBestSeller: false,
    status: true,
    variants: [
      { id: 'var-6-1', productId: 'prod-6', variantName: 'Standard 7L Maroon', weight: 8.5, price: 450.00, sku: 'FBS-TOL-006-7L', stock: 12 },
      { id: 'var-6-2', productId: 'prod-6', variantName: 'Pro Edition 10L Gold', weight: 12.0, price: 780.00, sku: 'FBS-TOL-006-10L', stock: 5 },
    ],
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-07-27T12:00:00Z',
  },
  {
    id: 'prod-7',
    sku: 'FBS-PKG-007',
    productName: 'Kraft Bakery Box Window 8x8x4 Inch',
    slug: 'kraft-bakery-box-window-8x8x4-inch',
    categoryId: 'cat-6',
    categoryName: 'Packaging Supply',
    brand: 'PackCraft',
    shortDescription: 'Eco-friendly food safe kraft paper box with clear window for 8-inch cakes.',
    description: 'Sturdy 350gsm eco-kraft paperboard boxes with clear PET display window. Flat packed for easy storage and auto-popup design for quick assembly.',
    mainImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: false,
    isBestSeller: true,
    status: true,
    variants: [
      { id: 'var-7-1', productId: 'prod-7', variantName: 'Pack of 10 Boxes', weight: 0.8, price: 18.00, sku: 'FBS-PKG-007-10P', stock: 100 },
      { id: 'var-7-2', productId: 'prod-7', variantName: 'Pack of 50 Boxes', weight: 4.0, price: 75.00, sku: 'FBS-PKG-007-50P', stock: 40 },
      { id: 'var-7-3', productId: 'prod-7', variantName: 'Carton of 200 Boxes', weight: 16.0, price: 260.00, sku: 'FBS-PKG-007-200P', stock: 15 },
    ],
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-07-27T15:00:00Z',
  },
  {
    id: 'prod-8',
    sku: 'FBS-CHO-008',
    productName: 'Valrhona Cocoa Powder 100% Dutch Processed',
    slug: 'valrhona-cocoa-powder-100-dutch-processed',
    categoryId: 'cat-2',
    categoryName: 'Chocolate & Cocoa',
    brand: 'Valrhona',
    shortDescription: 'Pure Dutch-processed cocoa powder with intense reddish-brown color & deep flavor.',
    description: 'Valrhona 100% Pure Cocoa Powder features a warm mahogany hue and velvety rich chocolate taste. Unsweetened with 21% fat content, making it perfect for chocolate cakes, brownies, and hot chocolate.',
    mainImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=800&auto=format&fit=crop'
    ],
    isHalal: true,
    isFeatured: true,
    isBestSeller: true,
    status: true,
    variants: [
      { id: 'var-8-1', productId: 'prod-8', variantName: '250g Pack', weight: 0.25, price: 28.00, sku: 'FBS-CHO-008-250G', stock: 75 },
      { id: 'var-8-2', productId: 'prod-8', variantName: '1kg Box', weight: 1.0, price: 95.00, sku: 'FBS-CHO-008-1KG', stock: 35 },
      { id: 'var-8-3', productId: 'prod-8', variantName: '3kg Commercial Pack', weight: 3.0, price: 260.00, sku: 'FBS-CHO-008-3KG', stock: 10 },
    ],
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-07-28T09:00:00Z',
  }
];

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
    buttonLink: '/products/belgian-dark-couverture-chocolate-70',
    status: true,
  },
  {
    id: 'ban-4',
    title: 'Commercial Stand Mixer 10L New Arrival',
    subtitle: 'Heavy-duty stainless steel mixer with multi-speed gear drive for commercial bakeries.',
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=1200&auto=format&fit=crop',
    buttonText: 'CEK BARANG BARU',
    buttonLink: '/products/commercial-stand-mixer-10l',
    status: true,
  }
];

let initialVouchers: Voucher[] = [
  {
    id: 'vouch-1',
    code: 'VIPBAKER20',
    title: 'Diskon Spesial VIP Member 20% OFF',
    discountType: 'PERCENT',
    discountValue: 20,
    minSpend: 100,
    targetTier: 'VIP',
    status: true,
    expiryDate: '2026-12-31',
    createdAt: '2026-07-01T08:00:00Z',
  },
  {
    id: 'vouch-2',
    code: 'WHOLESALE50',
    title: 'Potongan Grosir Komersial RM50 OFF',
    discountType: 'FIXED',
    discountValue: 50,
    minSpend: 300,
    targetTier: 'WHOLESALE',
    status: true,
    expiryDate: '2026-12-31',
    createdAt: '2026-07-10T08:00:00Z',
  },
  {
    id: 'vouch-3',
    code: 'WELCOMEFBS10',
    title: 'Voucher Selamat Datang RM10 OFF',
    discountType: 'FIXED',
    discountValue: 10,
    minSpend: 50,
    targetTier: 'ALL',
    status: true,
    expiryDate: '2026-12-31',
    createdAt: '2026-07-15T08:00:00Z',
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
      buttonLink: '/products/commercial-stand-mixer-10l',
    }
  ]
};

let adminCredentialData: AdminCredentialSetting = {
  email: 'admin@fbsbakeryworld.com',
  password: 'admin123',
};

let initialOrders: Order[] = [];

let initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Siti Nurhaliza',
    email: 'siti@example.com',
    phone: '+60129876543',
    customerType: 'VIP',
    address: 'No 12, Jalan Bunga Raya, Section 7',
    city: 'Shah Alam',
    state: 'Selangor',
    postcode: '40000',
    createdAt: '2026-05-10T08:00:00Z',
  }
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

const saveToStorage = <T>(key: string, value: T) => {
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

  getProductBySlug: (slug: string) => {
    const list = loadFromStorage<Product[]>('fbs_products', initialProducts);
    return list.find(p => p.slug === slug || p.id === slug);
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
  getOrders: () => {
    return loadFromStorage<Order[]>('fbs_orders', initialOrders);
  },

  getOrderByNumberAndPhone: (orderNumber: string, phone: string) => {
    const orders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return orders.find(o => {
      const matchNum = o.orderNumber.toUpperCase() === cleanNum || o.id === orderNumber;
      const matchPhone = o.customerPhone.replace(/[^0-9]/g, '').includes(cleanPhone) || cleanPhone.includes(o.customerPhone.replace(/[^0-9]/g, ''));
      return matchNum && matchPhone;
    });
  },

  createOrder: (orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const orders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    const customers = loadFromStorage<Customer[]>('fbs_customers', initialCustomers);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(orders.length + 101).padStart(3, '0');
    const orderNumber = `#FBS-${today}-${seq}`;
    
    const newOrder: Order = {
      ...orderInput,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    saveToStorage('fbs_orders', orders);

    // AUTO-INCREMENT TOTAL SOLD COUNTER ON PRODUCTS
    try {
      const products = loadFromStorage<Product[]>('fbs_products', initialProducts);
      orderInput.items.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.productId || p.productName.toLowerCase() === item.productName.toLowerCase());
        if (pIdx !== -1) {
          products[pIdx].totalSold = (products[pIdx].totalSold || 0) + (item.quantity || 1);
        }
      });
      saveToStorage('fbs_products', products);
    } catch (err) {
      console.error('Error auto-incrementing totalSold:', err);
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
    return newOrder;
  },

  updateOrderStatusAndTracking: (id: string, status: Order['orderStatus'], courierName?: string, trackingNumber?: string) => {
    const orders = loadFromStorage<Order[]>('fbs_orders', initialOrders);
    const idx = orders.findIndex(o => o.id === id || o.orderNumber === id);

    if (idx !== -1) {
      orders[idx].orderStatus = status;
      if (courierName) orders[idx].courierName = courierName;
      if (trackingNumber) orders[idx].trackingNumber = trackingNumber;
      if (status === 'SHIPPED') orders[idx].shippedAt = new Date().toISOString();
      orders[idx].updatedAt = new Date().toISOString();
      
      saveToStorage('fbs_orders', orders);
      return orders[idx];
    }
    return null;
  },

  // Customer Database CRM
  getCustomers: () => {
    return loadFromStorage<Customer[]>('fbs_customers', initialCustomers);
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

  // Vouchers CRUD API
  getVouchers: (): Voucher[] => {
    return loadFromStorage<Voucher[]>('fbs_vouchers', initialVouchers);
  },

  saveVoucher: (voucherInput: Partial<Voucher>): Voucher => {
    const vouchers = loadFromStorage<Voucher[]>('fbs_vouchers', initialVouchers);
    if (voucherInput.id) {
      const idx = vouchers.findIndex(v => v.id === voucherInput.id);
      if (idx !== -1) {
        vouchers[idx] = { ...vouchers[idx], ...voucherInput };
        saveToStorage('fbs_vouchers', vouchers);
        return vouchers[idx];
      }
    }
    const newVoucher: Voucher = {
      id: `vouch-${Date.now()}`,
      code: (voucherInput.code || 'PROMO10').toUpperCase().trim(),
      title: voucherInput.title || 'Special Discount Voucher',
      discountType: voucherInput.discountType || 'PERCENT',
      discountValue: voucherInput.discountValue || 10,
      minSpend: voucherInput.minSpend || 50,
      targetTier: voucherInput.targetTier || 'ALL',
      status: voucherInput.status ?? true,
      expiryDate: voucherInput.expiryDate || '2026-12-31',
      createdAt: new Date().toISOString(),
    };
    vouchers.unshift(newVoucher);
    saveToStorage('fbs_vouchers', vouchers);
    return newVoucher;
  },

  deleteVoucher: (id: string) => {
    let vouchers = loadFromStorage<Voucher[]>('fbs_vouchers', initialVouchers);
    vouchers = vouchers.filter(v => v.id !== id);
    saveToStorage('fbs_vouchers', vouchers);
    return true;
  },

  toggleVoucherStatus: (id: string) => {
    const vouchers = loadFromStorage<Voucher[]>('fbs_vouchers', initialVouchers);
    const idx = vouchers.findIndex(v => v.id === id);
    if (idx !== -1) {
      vouchers[idx].status = !vouchers[idx].status;
      saveToStorage('fbs_vouchers', vouchers);
      return vouchers[idx];
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
  getProductReviews: (productId: string): ProductReview[] => {
    const all = loadFromStorage<ProductReview[]>('fbs_product_reviews', initialReviewsData);
    return all.filter(r => r.productId === productId);
  },

  addReview: (review: Omit<ProductReview, 'id' | 'createdAt'>): ProductReview => {
    const all = loadFromStorage<ProductReview[]>('fbs_product_reviews', initialReviewsData);
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
    const reviews = loadFromStorage<ProductReview[]>('fbs_product_reviews', initialReviewsData).filter(r => r.productId === productId);
    if (reviews.length === 0) {
      return { averageRating: 5.0, reviewCount: 12 }; // Default high rating score for showcase
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / reviews.length;
    return {
      averageRating: parseFloat(avg.toFixed(1)),
      reviewCount: reviews.length,
    };
  },
};

const initialReviewsData: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    customerName: 'Puan Fatimah Zahra',
    customerPhone: '+6012****123',
    rating: 5,
    comment: 'Tepung semolina ini teksturnya sangat bagus dan halus! Tekstur bolu dan pasta buatan saya jadi sangat gurih dan mengembang sempurna. Packaging rapi dan pengiriman cepat.',
    createdAt: '2026-07-28T10:00:00Z',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop'],
    verifiedPurchase: true,
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    customerName: 'Chef Ahmad Naufal',
    customerPhone: '+6019****888',
    rating: 5,
    comment: 'Sudah langganan beli kemasan 5kg grosir untuk kafe saya. Kualitas terjamin Halal dan konsisten. Video demo pembuatannya bisa dilihat di bawah!',
    createdAt: '2026-07-27T14:30:00Z',
    images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-kneading-dough-on-a-table-42938-large.mp4',
    verifiedPurchase: true,
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    customerName: 'Siti Aisyah',
    customerPhone: '+6017****555',
    rating: 5,
    comment: 'Matcha Uji Kyoto asli dari Jepang! Warnanya hijau emerald pekat dan wanginya harum autentik. Sangat direkomendasikan untuk bento cake dan matcha latte.',
    createdAt: '2026-07-26T09:15:00Z',
    images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop'],
    verifiedPurchase: true,
  },
];

