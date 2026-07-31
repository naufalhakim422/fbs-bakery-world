export type Role = 'OWNER' | 'ADMIN' | 'STAFF';

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string; // e.g. "500g", "1kg", "5kg", "25kg"
  weight: number;      // in kg
  price: number;       // MYR price
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  productName: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  brand: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  galleryImages: string[];
  isHalal: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  status: boolean;
  totalSold?: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  subtotal: number;
  mainImage?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // #FBS-YYYYMMDD-XXX
  customerId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  notes?: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  shippedAt?: string;
  whatsappUrl?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  coverPhoto?: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'VIP';
  provider?: 'GOOGLE' | 'FACEBOOK' | 'EMAIL' | 'PHONE' | 'FORM';
  address: string;
  city: string;
  state: string;
  postcode: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  galleryImages?: string[];
  videoUrl?: string; // Optional video URL or Base64 uploaded video file
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookingTime: number; // in mins
  relatedProductIds: string[];
  createdAt: string;
}

export interface BlogContentBlock {
  id: string;
  image?: string;       // image URL or base64
  caption?: string;     // image caption
  text?: string;        // paragraph/description text
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  type: 'ARTICLE' | 'VIDEO';   // post type
  excerpt: string;
  content: string;              // main body text (for ARTICLE)
  image: string;                // cover image
  galleryImages?: string[];
  contentBlocks?: BlogContentBlock[]; // multi image+text blocks for ARTICLE
  embedUrl?: string;            // YouTube/Instagram/TikTok embed URL for VIDEO
  videoUrl?: string;            // Optional video data URL (uploaded video)
  videoThumbnail?: string;      // Optional thumbnail for video post


  author: string;
  tags?: string[];
  createdAt: string;
}



export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  status: boolean;
  videoUrl?: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minSpend: number;
  targetTier: 'ALL' | 'RETAIL' | 'VIP' | 'WHOLESALE';
  status: boolean;
  expiryDate?: string;
  createdAt: string;
}

export interface StoreSetting {
  whatsappNumber: string;
  whatsappBusinessName: string;
  storeName: string;
  currency: string;
  announcement: string;
  supportEmail: string;
  address: string;
  googleMapsEmbedUrl?: string;
  googleMapsAppUrl?: string;
}

export interface AboutSetting {
  heroTitle: string;
  heroSubtitle: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  heroImage: string;
  statYears: string;
  statBakers: string;
  statProducts: string;
  statSatisfaction: string;
  visionText: string;
  missionText: string;
}

export interface WholesalePromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

export interface HomePageSetting {
  heroTagline: string;
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryBtnText: string;
  heroPrimaryBtnLink: string;
  heroSecondaryBtnText: string;
  heroSecondaryBtnLink: string;
  heroBgImage: string;
  featuredTitle: string;
  featuredSubtitle: string;
  bestsellerTitle: string;
  bestsellerSubtitle: string;
  promoTitle: string;
  promoSubtitle: string;
  promoImage: string;
  wholesaleBanners?: WholesalePromoBanner[];
}

export interface AdminCredentialSetting {
  email: string;
  password: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
  images?: string[];
  videoUrl?: string; // Optional MP4/WebM video URL or Base64 uploaded video file
  verifiedPurchase?: boolean;
}

export interface VideoPost {
  id: string;
  title: string;
  description: string;
  platform: 'YOUTUBE' | 'TIKTOK' | 'FBS';
  embedUrl: string;
  thumbnail: string;
  duration: string;
  category: string;
  status: 'PUBLISHED' | 'DRAFT';
  isFeatured: boolean;
  createdAt: string;
}


