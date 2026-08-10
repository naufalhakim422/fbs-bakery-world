import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function ensureProductSchemaText() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ALTER COLUMN "mainImage" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ALTER COLUMN "description" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ALTER COLUMN "shortDescription" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Variant" ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION DEFAULT 0;`);
  } catch (e) {
    // Ignored if already created
  }
}

const antiCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// GET /api/products
// Query parameters: id, slug, category, search, featured, bestSeller, status, page, limit
export async function GET(request: Request) {
  try {
    await ensureProductSchemaText();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const bestSeller = searchParams.get('bestSeller');
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Single Product lookup by ID or Slug
    if (id || slug) {
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            ...(id ? [{ id }] : []),
            ...(slug ? [{ slug }] : []),
          ],
          deletedAt: null,
        },
        include: {
          category: true,
          variants: { where: { deletedAt: null } },
          reviews: { where: { deletedAt: null } },
        },
      });

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404, headers: antiCacheHeaders });
      }

      return NextResponse.json({ success: true, product, source: 'PRISMA_POSTGRES' }, { headers: antiCacheHeaders });
    }

    // Build filter condition
    const whereCondition: any = { deletedAt: null };

    if (category) {
      whereCondition.category = {
        OR: [
          { slug: category },
          { id: category },
        ],
      };
    }

    if (featured === 'true') {
      whereCondition.isFeatured = true;
    }

    if (bestSeller === 'true') {
      whereCondition.isBestSeller = true;
    }

    if (statusParam === 'active') {
      whereCondition.status = true;
    } else if (statusParam === 'inactive') {
      whereCondition.status = false;
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      whereCondition.OR = [
        { productName: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereCondition,
        include: {
          category: true,
          variants: { where: { deletedAt: null }, orderBy: { price: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      source: 'PRISMA_POSTGRES',
    }, { headers: antiCacheHeaders });
  } catch (err: any) {
    console.error('[Prisma Products GET Error]:', err);
    return NextResponse.json({ success: false, error: `Database Error: ${err.message}` }, { status: 500, headers: antiCacheHeaders });
  }
}

// POST /api/products
// Body: { productName, categoryId, sku, slug, brand, shortDescription, description, mainImage, galleryImages, isHalal, isFeatured, isBestSeller, status, variants }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productName,
      categoryId,
      sku,
      slug,
      brand,
      shortDescription,
      description,
      mainImage,
      galleryImages,
      isHalal,
      isFeatured,
      isBestSeller,
      status,
      variants,
    } = body || {};

    // Validation
    if (!productName || !categoryId || !sku || !slug || !description || !mainImage) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productName, categoryId, sku, slug, description, mainImage' },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one variant with name, weight, price, and SKU is required' },
        { status: 400 }
      );
    }

    // Atomic Prisma Transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      // Check existing SKU or Slug
      const existing = await tx.product.findFirst({
        where: {
          OR: [{ sku }, { slug }],
          deletedAt: null,
        },
      });

      if (existing) {
        throw new Error(`Product with SKU "${sku}" or Slug "${slug}" already exists`);
      }

      // Verify category exists
      const categoryExists = await tx.category.findUnique({
        where: { id: categoryId },
      });

      if (!categoryExists) {
        throw new Error(`Category with ID "${categoryId}" does not exist`);
      }

      // Create Product
      const created = await tx.product.create({
        data: {
          id: body.id || `prod-${Date.now()}`,
          categoryId,
          sku,
          productName,
          slug,
          brand: brand || 'FBS Bakery',
          shortDescription: shortDescription || '',
          description,
          mainImage,
          galleryImages: Array.isArray(galleryImages) ? galleryImages : [mainImage],
          isHalal: isHalal ?? true,
          isFeatured: isFeatured ?? false,
          isBestSeller: isBestSeller ?? false,
          status: status ?? true,
          totalSold: body.totalSold || 0,
        },
      });

      // Create / Upsert Variants
      for (const v of variants) {
        if (!v.variantName || v.price === undefined) {
          throw new Error('Variant requires variantName and price');
        }

        if (v.stock !== undefined && v.stock < 0) {
          throw new Error(`Variant "${v.variantName}" cannot have negative stock`);
        }

        const vSku = v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const existingVariant = await tx.variant.findFirst({
          where: {
            OR: [
              { sku: vSku },
              ...(v.id ? [{ id: v.id }] : []),
            ],
          },
        });

        if (existingVariant) {
          await tx.variant.update({
            where: { id: existingVariant.id },
            data: {
              variantName: v.variantName,
              weight: parseFloat(v.weight) || undefined,
              price: parseFloat(v.price),
              originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : 0,
              stock: parseInt(v.stock, 10) || 0,
              updatedAt: new Date(),
            },
          });
        } else {
          await tx.variant.create({
            data: {
              id: v.id || `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              productId: created.id,
              variantName: v.variantName,
              weight: parseFloat(v.weight) || 1.0,
              price: parseFloat(v.price),
              originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : 0,
              sku: vSku,
              stock: parseInt(v.stock, 10) || 0,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id: created.id },
        include: { category: true, variants: true },
      });
    });

    console.log('✅ [Prisma Product Created]:', newProduct?.productName);
    return NextResponse.json({ success: true, product: newProduct, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Products POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// PATCH /api/products
// Body: { id, productName, categoryId, brand, shortDescription, description, mainImage, galleryImages, isHalal, isFeatured, isBestSeller, status, variants }
export async function PATCH(request: Request) {
  try {
    await ensureProductSchemaText();
    const body = await request.json();
    const { id, variants, ...updateData } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findFirst({
        where: {
          OR: [
            { id },
            ...(updateData.slug ? [{ slug: updateData.slug }] : []),
          ],
        },
      });

      if (!existingProduct) {
        throw new Error(`Product with ID or Slug "${id}" not found`);
      }

      const targetId = existingProduct.id;

      // Update Product fields
      await tx.product.update({
        where: { id: targetId },
        data: {
          ...(updateData.productName ? { productName: updateData.productName } : {}),
          ...(updateData.categoryId ? { categoryId: updateData.categoryId } : {}),
          ...(updateData.brand ? { brand: updateData.brand } : {}),
          ...(updateData.shortDescription !== undefined ? { shortDescription: updateData.shortDescription } : {}),
          ...(updateData.description ? { description: updateData.description } : {}),
          ...(updateData.mainImage ? { mainImage: updateData.mainImage } : {}),
          ...(updateData.galleryImages ? { galleryImages: updateData.galleryImages } : {}),
          ...(updateData.isHalal !== undefined ? { isHalal: updateData.isHalal } : {}),
          ...(updateData.isFeatured !== undefined ? { isFeatured: updateData.isFeatured } : {}),
          ...(updateData.isBestSeller !== undefined ? { isBestSeller: updateData.isBestSeller } : {}),
          ...(updateData.status !== undefined ? { status: updateData.status } : {}),
          updatedAt: new Date(),
        },
      });

      // Upsert Variants if provided
      if (Array.isArray(variants)) {
        for (const v of variants) {
          if (v.stock !== undefined && v.stock < 0) {
            throw new Error(`Variant "${v.variantName}" stock cannot be negative`);
          }

          const vSku = v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          const existingVariant = await tx.variant.findFirst({
            where: {
              OR: [
                { sku: vSku },
                ...(v.id ? [{ id: v.id }] : []),
              ],
            },
          });

          if (existingVariant) {
            await tx.variant.update({
              where: { id: existingVariant.id },
              data: {
                variantName: v.variantName,
                weight: parseFloat(v.weight) || undefined,
                price: v.price !== undefined ? parseFloat(v.price) : undefined,
                originalPrice: v.originalPrice !== undefined ? parseFloat(v.originalPrice) : undefined,
                stock: v.stock !== undefined ? parseInt(v.stock, 10) : undefined,
                updatedAt: new Date(),
              },
            });
          } else {
            await tx.variant.create({
              data: {
                id: v.id || `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                productId: targetId,
                variantName: v.variantName,
                weight: parseFloat(v.weight) || 1.0,
                price: parseFloat(v.price) || 0.0,
                originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : 0,
                sku: vSku,
                stock: parseInt(v.stock, 10) || 0,
              },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { category: true, variants: true },
      });
    });

    console.log('✅ [Prisma Product Updated]:', updatedProduct?.productName);
    return NextResponse.json({ success: true, product: updatedProduct, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Products PATCH Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// DELETE /api/products?id=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteId = searchParams.get('id');

    if (!deleteId) {
      return NextResponse.json({ success: false, error: 'Product ID parameter is required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id: deleteId } });
      if (!existing) {
        throw new Error(`Product with ID "${deleteId}" not found`);
      }

      // Soft delete Product & Variants
      await tx.product.update({
        where: { id: deleteId },
        data: { deletedAt: new Date() },
      });

      await tx.variant.updateMany({
        where: { productId: deleteId },
        data: { deletedAt: new Date() },
      });
    });

    console.log('✅ [Prisma Product Soft Deleted]:', deleteId);
    return NextResponse.json({ success: true, message: `Product ${deleteId} deleted`, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Products DELETE Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export const PUT = PATCH;
