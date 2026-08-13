import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function ensureProductSchemaText() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ALTER COLUMN "mainImage" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ALTER COLUMN "description" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ALTER COLUMN "shortDescription" TYPE TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Variant" ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION DEFAULT 0;`);
    
    // Purge unwanted sample dummy products permanently from Railway PostgreSQL DB
    await prisma.$executeRawUnsafe(`UPDATE "Product" SET "deletedAt" = NOW(), "status" = false WHERE "id" IN ('prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6', 'prod-7', 'prod-8') OR "productName" ILIKE '%Pure Unsalted Butter%' OR "productName" ILIKE '%Semolina Flour%' OR "sku" ILIKE '%FBS-BTR%';`);
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

    if (statusParam === 'inactive') {
      whereCondition.status = false;
    } else if (statusParam !== 'all') {
      whereCondition.status = true;
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

    // Resilient Validation & Fallbacks
    if (!productName || !productName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product Title / Name is required' },
        { status: 400 }
      );
    }

    if (!mainImage || !mainImage.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product Main Cover Image is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least 1 packaging size variant is required' },
        { status: 400 }
      );
    }

    const finalDescription = (description && description.trim()) || (shortDescription && shortDescription.trim()) || productName;
    const finalShortDescription = (shortDescription && shortDescription.trim()) || finalDescription;
    let finalSku = (sku && sku.trim()) || `FBS-PRD-${Math.floor(1000 + Math.random() * 9000)}`;
    let finalSlug = (slug && slug.trim()) || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Atomic Prisma Transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      // Category fallback validation
      let validCatId = categoryId || null;
      if (validCatId) {
        const catExists = await tx.category.findFirst({
          where: { OR: [{ id: validCatId }, { slug: validCatId }] }
        });
        if (catExists) {
          validCatId = catExists.id;
        } else {
          const firstCat = await tx.category.findFirst({ where: { deletedAt: null } });
          validCatId = firstCat ? firstCat.id : null;
        }
      } else {
        const firstCat = await tx.category.findFirst({ where: { deletedAt: null } });
        validCatId = firstCat ? firstCat.id : null;
      }

      // Check existing SKU or Slug collision and resolve dynamically
      const existingSku = await tx.product.findFirst({ where: { sku: finalSku, deletedAt: null } });
      if (existingSku) {
        finalSku = `${finalSku}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const existingSlug = await tx.product.findFirst({ where: { slug: finalSlug, deletedAt: null } });
      if (existingSlug) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }

      const created = await tx.product.create({
        data: {
          id: body.id || `prod-${Date.now()}`,
          sku: finalSku,
          productName,
          slug: finalSlug,
          categoryId: validCatId,
          brand: brand || 'FBS Choice',
          shortDescription: finalShortDescription,
          description: finalDescription,
          mainImage,
          galleryImages: Array.isArray(galleryImages) && galleryImages.length > 0 ? galleryImages : [mainImage],
          isHalal: isHalal !== undefined ? Boolean(isHalal) : true,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
          isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : false,
          status: status !== undefined ? Boolean(status) : true,
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

      let targetId = id;
      let validCatId = updateData.categoryId || null;
      if (validCatId) {
        const catExists = await tx.category.findFirst({
          where: {
            OR: [
              { id: validCatId },
              { slug: validCatId },
            ],
          },
        });
        validCatId = catExists ? catExists.id : null;
      }

      if (!existingProduct) {
        // Auto-create product in Railway PostgreSQL DB if it was only in local seed
        const createdProd = await tx.product.create({
          data: {
            id,
            sku: updateData.sku || `SKU-${Date.now()}`,
            productName: updateData.productName || 'Unnamed Product',
            slug: updateData.slug || `product-${Date.now()}`,
            categoryId: validCatId,
            brand: updateData.brand || 'FBS Bakery World',
            shortDescription: updateData.shortDescription || '',
            description: updateData.description || '',
            mainImage: updateData.mainImage || '',
            galleryImages: updateData.galleryImages || [],
            isHalal: updateData.isHalal !== undefined ? updateData.isHalal : true,
            isFeatured: updateData.isFeatured !== undefined ? updateData.isFeatured : false,
            isBestSeller: updateData.isBestSeller !== undefined ? updateData.isBestSeller : false,
            status: updateData.status !== undefined ? updateData.status : true,
          },
        });
        targetId = createdProd.id;
      } else {
        targetId = existingProduct.id;
        // Update Product fields
        await tx.product.update({
          where: { id: targetId },
          data: {
            ...(updateData.productName ? { productName: updateData.productName } : {}),
            ...(validCatId ? { categoryId: validCatId } : {}),
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
      }

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

        // Soft-delete variants that were removed from the admin form
        const activeSkus = variants.map(v => v.sku).filter(Boolean);
        const activeIds = variants.map(v => v.id).filter(Boolean);

        await tx.variant.updateMany({
          where: {
            productId: targetId,
            deletedAt: null,
            NOT: {
              OR: [
                ...(activeSkus.length > 0 ? [{ sku: { in: activeSkus } }] : []),
                ...(activeIds.length > 0 ? [{ id: { in: activeIds } }] : []),
              ],
            },
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      return tx.product.findUnique({
        where: { id: targetId },
        include: {
          category: true,
          variants: { where: { deletedAt: null } },
        },
      });
    });

    console.log('✅ [Prisma Product Updated]:', updatedProduct?.productName);
    return NextResponse.json({ success: true, product: updatedProduct, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Products PATCH Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// DELETE /api/products?id=... or ?slug=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteId = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!deleteId && !slug) {
      return NextResponse.json({ success: false, error: 'Product ID or Slug parameter is required' }, { status: 400 });
    }

    const targetProduct = await prisma.product.findFirst({
      where: {
        OR: [
          ...(deleteId ? [{ id: deleteId }] : []),
          ...(slug ? [{ slug }] : []),
        ],
        deletedAt: null,
      },
    });

    if (!targetProduct) {
      return NextResponse.json({ success: true, message: 'Product already deleted or not found' });
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete Product & Variants
      await tx.product.update({
        where: { id: targetProduct.id },
        data: { deletedAt: new Date(), status: false },
      });

      await tx.variant.updateMany({
        where: { productId: targetProduct.id },
        data: { deletedAt: new Date() },
      });
    });

    console.log('✅ [Prisma Product Soft Deleted]:', targetProduct.id, targetProduct.productName);
    return NextResponse.json({ success: true, message: `Product ${targetProduct.productName} deleted`, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Products DELETE Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export const PUT = PATCH;
