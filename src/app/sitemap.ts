import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fbsbaker.store';
  
  const staticRoutes = [
    '',
    '/products',
    '/categories',
    '/recipes',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/compare',
    '/track-order',
    '/account/login',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic Product routes
  const products = db.getProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Dynamic Blog routes
  const blogs = db.getBlogs();
  const blogEntries: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: new Date(b.updatedAt || b.createdAt || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Dynamic Recipe routes
  const recipes = db.getRecipes();
  const recipeEntries: MetadataRoute.Sitemap = recipes.map((r) => ({
    url: `${baseUrl}/recipes/${r.slug}`,
    lastModified: new Date(r.updatedAt || r.createdAt || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...blogEntries, ...recipeEntries];
}

