import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/admin2026/'],
    },
    sitemap: 'https://fbsbakeryworld.com/sitemap.xml',
  };
}
