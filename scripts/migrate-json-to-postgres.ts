import { PrismaClient, OrderStatus, CustomerType, AuthProvider, Role } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Phase 4: Safe Data Migration from JSON to PostgreSQL...');

  const dataDir = path.join(process.cwd(), 'data');
  const ordersFilePath = path.join(dataDir, 'fbs_orders.json');
  const deletedFilePath = path.join(dataDir, 'fbs_deleted_orders.json');
  const overridesFilePath = path.join(dataDir, 'fbs_status_overrides.json');

  let rawOrders: any[] = [];
  let deletedOrderIds: string[] = [];
  let statusOverrides: Record<string, any> = {};

  if (fs.existsSync(ordersFilePath)) {
    try {
      rawOrders = JSON.parse(fs.readFileSync(ordersFilePath, 'utf-8'));
    } catch (e) {
      console.warn('Warning reading fbs_orders.json:', e);
    }
  }

  if (fs.existsSync(deletedFilePath)) {
    try {
      deletedOrderIds = JSON.parse(fs.readFileSync(deletedFilePath, 'utf-8'));
    } catch (e) {
      console.warn('Warning reading fbs_deleted_orders.json:', e);
    }
  }

  if (fs.existsSync(overridesFilePath)) {
    try {
      statusOverrides = JSON.parse(fs.readFileSync(overridesFilePath, 'utf-8'));
    } catch (e) {
      console.warn('Warning reading fbs_status_overrides.json:', e);
    }
  }

  console.log(`📊 Found ${rawOrders.length} raw orders in fbs_orders.json`);
  console.log(`📊 Found ${deletedOrderIds.length} deleted order IDs in blacklist`);
  console.log(`📊 Found ${Object.keys(statusOverrides).length} status overrides`);

  // Default Categories Data
  const categories = [
    { id: 'cat-1', name: 'Flour & Powder', slug: 'flour-powder', description: 'Tepung terigu, tepung gandum, & tepung khusus bakery berkualiti tinggi', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', sortOrder: 1 },
    { id: 'cat-2', name: 'Butter & Dairy', slug: 'butter-dairy', description: 'Mentega mentega khas bakery, keju krim, & susu berkualiti premium', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80', sortOrder: 2 },
    { id: 'cat-3', name: 'Chocolate & Cocoa', slug: 'chocolate-cocoa', description: 'Coklat masakan, coklat cip, & serbuk koko premium impor', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&q=80', sortOrder: 3 },
    { id: 'cat-4', name: 'Yeast & Additives', slug: 'yeast-additives', description: 'Ragi instan, pelembut roti, & bahan pengembang bakery terbaik', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80', sortOrder: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image, sortOrder: cat.sortOrder },
      create: { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, sortOrder: cat.sortOrder },
    });
  }
  console.log('✅ Categories imported/verified');

  // Default Products & Variants Data
  const products = [
    {
      id: 'prod-1',
      sku: 'FBS-FLR-001',
      productName: 'Tepung Gandum Premium Roti High Protein (25kg)',
      slug: 'tepung-gandum-premium-roti-high-protein-25kg',
      categoryId: 'cat-1',
      brand: 'FBS Bakery',
      shortDescription: 'Tepung protein tinggi sesuai untuk pembuatan roti buku, donut, & pastry bertekstur lembut.',
      description: 'Tepung gandum gred profesional dengan kandungan protein 12.5% - 13.5%. Menghasilkan doh roti yang elastik, mengembang sempurna, dan tahan kelembapan.',
      mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80'],
      isHalal: true,
      isFeatured: true,
      isBestSeller: true,
      status: true,
      totalSold: 142,
      variants: [
        { id: 'var-1-1', variantName: '1kg Pack', weight: 1.0, price: 6.5, sku: 'FBS-FLR-001-1KG', stock: 250 },
        { id: 'var-1-2', variantName: '5kg Pack', weight: 5.0, price: 29.0, sku: 'FBS-FLR-001-5KG', stock: 120 },
        { id: 'var-1-3', variantName: '25kg Commercial Bag', weight: 25.0, price: 128.0, sku: 'FBS-FLR-001-25KG', stock: 45 },
      ],
    },
    {
      id: 'prod-2',
      sku: 'FBS-BTR-002',
      productName: 'Pure Unsalted Butter Creamery Pastry (2kG)',
      slug: 'pure-unsalted-butter-creamery-pastry-2kg',
      categoryId: 'cat-2',
      brand: 'FBS Bakery',
      shortDescription: 'Mentega tulen tanpa garam tinggi lemak susu 82% untuk kek lapis & croissant krispi.',
      description: 'Mentega beraroma wangi semula jadi tanpa bahan pengawet. Ideal untuk menghasilkan lapisan pastry flaky dan kelembutan biskut raya.',
      mainImage: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80'],
      isHalal: true,
      isFeatured: true,
      isBestSeller: true,
      status: true,
      totalSold: 98,
      variants: [
        { id: 'var-2-1', variantName: '500g Block', weight: 0.5, price: 24.5, sku: 'FBS-BTR-002-500G', stock: 80 },
        { id: 'var-2-2', variantName: '2kg Commercial Box', weight: 2.0, price: 89.0, sku: 'FBS-BTR-002-2KG', stock: 35 },
      ],
    },
  ];

  for (const prod of products) {
    const { variants, ...prodData } = prod;
    await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: { productName: prodData.productName, brand: prodData.brand },
      create: {
        id: prodData.id,
        sku: prodData.sku,
        productName: prodData.productName,
        slug: prodData.slug,
        categoryId: prodData.categoryId,
        brand: prodData.brand,
        shortDescription: prodData.shortDescription,
        description: prodData.description,
        mainImage: prodData.mainImage,
        galleryImages: prodData.galleryImages,
        isHalal: prodData.isHalal,
        isFeatured: prodData.isFeatured,
        isBestSeller: prodData.isBestSeller,
        status: prodData.status,
        totalSold: prodData.totalSold,
      },
    });

    for (const v of variants) {
      await prisma.variant.upsert({
        where: { sku: v.sku },
        update: { variantName: v.variantName, price: v.price, stock: v.stock },
        create: {
          id: v.id,
          productId: prodData.id,
          variantName: v.variantName,
          weight: v.weight,
          price: v.price,
          sku: v.sku,
          stock: v.stock,
        },
      });
    }
  }
  console.log('✅ Products & Variants imported/verified');

  // Default Customers Data
  const defaultCustomers = [
    { id: 'cust-1', name: 'Muhammad Jaka', email: 'nopaldeso1@gmail.com', phone: '+60123456789', customerType: CustomerType.RETAIL },
    { id: 'cust-2', name: 'Siti Sarah Bakery', email: 'sitisarah@gmail.com', phone: '+60198765432', customerType: CustomerType.WHOLESALE },
  ];

  for (const c of defaultCustomers) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: { name: c.name, phone: c.phone },
      create: {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        customerType: c.customerType,
        provider: AuthProvider.EMAIL,
        isVerified: true,
      },
    });
  }

  // Filter out deleted orders
  const validOrders = rawOrders.filter(
    o => !deletedOrderIds.includes(o.id) && !deletedOrderIds.includes(o.orderNumber)
  );

  console.log(`📦 Processing ${validOrders.length} valid active orders for PostgreSQL migration...`);

  const mapStatusToPrismaEnum = (statusStr: string): OrderStatus => {
    switch (statusStr) {
      case 'PENDING_PAYMENT':
      case 'NEW':
        return OrderStatus.Pending;
      case 'PAYMENT_VERIFIED':
        return OrderStatus.WaitingPayment;
      case 'CONFIRMED':
        return OrderStatus.Paid;
      case 'PACKING':
      case 'PROCESSING':
        return OrderStatus.Packing;
      case 'READY_TO_SHIP':
        return OrderStatus.ReadyToShip;
      case 'SHIPPING':
      case 'SHIPPED':
        return OrderStatus.Shipped;
      case 'DELIVERED':
      case 'COMPLETED':
        return OrderStatus.Completed;
      case 'CANCELLED':
      case 'CANCEL_REQUESTED':
        return OrderStatus.Cancelled;
      case 'REFUND':
        return OrderStatus.Refunded;
      default:
        return OrderStatus.Pending;
    }
  };

  for (const ord of validOrders) {
    const ov = statusOverrides[ord.id] || statusOverrides[ord.orderNumber];
    const finalStatusStr = ov?.orderStatus || ord.orderStatus || 'PENDING_PAYMENT';
    const finalStatusEnum = mapStatusToPrismaEnum(finalStatusStr);
    const finalCourier = ov?.courierName || ord.courierName || 'J&T Express';
    const finalTracking = ov?.trackingNumber !== undefined ? ov.trackingNumber : ord.trackingNumber;

    // Upsert Order
    await prisma.order.upsert({
      where: { orderNumber: ord.orderNumber },
      update: {
        status: finalStatusEnum,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        totalAmount: ord.totalAmount || 0,
      },
      create: {
        id: ord.id && ord.id.startsWith('ord-') ? ord.id : `ord-${Date.now()}`,
        orderNumber: ord.orderNumber,
        customerName: ord.customerName,
        customerEmail: ord.customerEmail || 'customer@fbsbaker.store',
        customerPhone: ord.customerPhone,
        address: ord.address || 'Alamat Utama',
        city: ord.city || 'Kuala Lumpur',
        state: ord.state || 'Wilayah Persekutuan',
        postcode: ord.postcode || '50000',
        notes: ord.notes,
        subtotal: ord.totalAmount || 0,
        shippingFee: 10.0,
        discount: 0.0,
        totalAmount: ord.totalAmount || 0,
        status: finalStatusEnum,
        createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date(),
        updatedAt: ord.updatedAt ? new Date(ord.updatedAt) : new Date(),
      },
    });

    // Tracking
    if (finalTracking) {
      await prisma.tracking.upsert({
        where: { orderId: ord.id },
        update: { trackingNumber: finalTracking, courierName: finalCourier },
        create: {
          orderId: ord.id,
          courierName: finalCourier,
          trackingNumber: finalTracking,
          trackingUrl: `https://www.jtexpress.my/tracking/${encodeURIComponent(finalTracking)}`,
        },
      });
    }

    // Timeline Events
    await prisma.timeline.create({
      data: {
        orderId: ord.id,
        status: finalStatusEnum,
        title: `Status: ${finalStatusStr}`,
        description: `Pesanan berada dalam status ${finalStatusStr}.`,
        updatedBy: 'System Migration',
      },
    });
  }

  console.log('✅ Orders, Tracking & Timelines migrated successfully!');
}

main()
  .catch(e => {
    console.error('❌ Phase 4 Migration Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
