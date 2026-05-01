import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledebativoirien.net';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/track',
        '/api/ad-click',
        '/api/payment/',
        '/mon-compte/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
