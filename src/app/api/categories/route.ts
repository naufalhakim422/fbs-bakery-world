import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/categories
// Query params: id, slug, search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const search = searchParams.get('search');

    if (id || slug) {
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            ...(id ? [{ id }] : []),
            ...(slug ? [{ slug }] : []),
          ],
          deletedAt: null,
        },
        include: {
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
      });

      if (!category) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, category, source: 'PRISMA_POSTGRES' });
    }

    const whereCondition: any = { deletedAt: null };
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      whereCondition.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const categories = await prisma.category.findMany({
      where: whereCondition,
      include: {
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, categories, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Categories GET Error]:', err);
    return NextResponse.json({ success: false, error: `Database Error: ${err.message}` }, { status: 500 });
  }
}

// POST /api/categories
// Body: { name, slug, description, image, sortOrder }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, sortOrder } = body || {};

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Name and slug are required' }, { status: 400 });
    }

    // Check slug conflict
    const existing = await prisma.category.findFirst({
      where: { slug, deletedAt: null },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: `Category with slug "${slug}" already exists` }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        id: body.id || `cat-${Date.now()}`,
        name,
        slug,
        description: description || '',
        image: image || null,
        sortOrder: parseInt(sortOrder || '0', 10),
      },
    });

    console.log('✅ [Prisma Category Created]:', category.name);
    return NextResponse.json({ success: true, category, source: 'PRISMA_POSTGRES' }, { status: 201 });
  } catch (err: any) {
    console.error('[Prisma Categories POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/categories
// Body: { id, name, slug, description, image, sortOrder }
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, description, image, sortOrder } = body || {};

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing || existing.deletedAt !== null) {
      return NextResponse.json({ success: false, error: `Category with ID "${id}" not found` }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.category.findFirst({
        where: { slug, deletedAt: null, NOT: { id } },
      });
      if (slugConflict) {
        return NextResponse.json({ success: false, error: `Category with slug "${slug}" already exists` }, { status: 409 });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(sortOrder !== undefined ? { sortOrder: parseInt(sortOrder, 10) } : {}),
        updatedAt: new Date(),
      },
    });

    console.log('✅ [Prisma Category Updated]:', updated.name);
    return NextResponse.json({ success: true, category: updated, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Categories PATCH Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/categories?id=...
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteId = searchParams.get('id');

    if (!deleteId) {
      return NextResponse.json({ success: false, error: 'Category ID parameter is required' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { id: deleteId } });
    if (!existing || existing.deletedAt !== null) {
      return NextResponse.json({ success: false, error: `Category with ID "${deleteId}" not found` }, { status: 404 });
    }

    // Soft delete Category
    await prisma.category.update({
      where: { id: deleteId },
      data: { deletedAt: new Date() },
    });

    console.log('✅ [Prisma Category Soft Deleted]:', deleteId);
    return NextResponse.json({ success: true, message: `Category ${deleteId} deleted`, source: 'PRISMA_POSTGRES' });
  } catch (err: any) {
    console.error('[Prisma Categories DELETE Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
