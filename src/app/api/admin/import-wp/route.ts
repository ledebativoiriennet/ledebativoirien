import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import he from 'he';

// Protection par secret
const SEED_SECRET = process.env.SEED_SECRET || 'changeme-in-production';

function getString(val: any): string | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val.__cdata !== undefined) return String(val.__cdata);
  return String(val);
}

const SLUG_ALIASES: Record<string, string> = {
  'art-culture':       'culture',
  'arts':              'culture',
  'politiques':        'politique',
  'economie-finances': 'economie',
  'finances':          'economie',
  'faits_divers':      'faits-divers',
  'international':     'internationale',
};

function normalizeSlug(slug: string): string {
  return SLUG_ALIASES[slug] || slug;
}

async function ensureCategory(slug: string, name: string) {
  const normalized = normalizeSlug(slug);
  let cat = await prisma.category.findUnique({ where: { slug: normalized } });
  if (!cat) {
    cat = await prisma.category.create({
      data: { slug: normalized, name: name || normalized }
    });
  }
  return cat;
}

export async function POST(request: Request) {
  // Verify secret header
  const authHeader = request.headers.get('x-seed-secret');
  if (authHeader !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No XML file provided' }, { status: 400 });
    }

    const xmlData = await file.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      cdataPropName: '__cdata',
      tagValueProcessor: (tagName: string, tagValue: any) => {
        try {
          return typeof tagValue === 'string' ? he.decode(tagValue) : tagValue;
        } catch {
          return tagValue;
        }
      }
    });

    const jsonObj = parser.parse(xmlData);
    const channel = jsonObj.rss?.channel;

    if (!channel) {
      return NextResponse.json({ error: 'Invalid WordPress XML format' }, { status: 400 });
    }

    const log: string[] = [];

    // 1. Authors
    const authors = channel['wp:author'] || [];
    const authorArray = Array.isArray(authors) ? authors : [authors];
    for (const author of authorArray) {
      if (!author) continue;
      const wpId = parseInt(author['wp:author_id']);
      const login = getString(author['wp:author_login']) || 'unknown';
      const email = getString(author['wp:author_email']);
      const name = getString(author['wp:author_display_name']) || login;
      await prisma.author.upsert({
        where: { slug: login },
        update: { name, email, wpId },
        create: { slug: login, name, email, wpId },
      });
    }
    log.push(`Authors: ${authorArray.length} processed`);

    // 2. Categories from channel header (may be 0 in some exports)
    const categories = channel['wp:category'] || [];
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    for (const cat of categoryArray) {
      if (!cat) continue;
      const wpId = parseInt(cat['wp:term_id']);
      const slug = getString(cat['wp:category_nicename']) || `cat-${wpId}`;
      const name = getString(cat['wp:cat_name']) || slug;
      try {
        await prisma.category.upsert({
          where: { slug },
          update: { name, wpId },
          create: { slug, name, wpId },
        });
      } catch { /* ignore */ }
    }
    log.push(`Categories from header: ${categoryArray.length} processed`);

    // 3. Articles
    const items = channel.item || [];
    const itemArray = Array.isArray(items) ? items : [items];
    const articles = itemArray.filter(
      (i: any) => getString(i['wp:post_type']) === 'post' && getString(i['wp:status']) === 'publish'
    );

    let count = 0;
    let errors = 0;

    for (const item of articles) {
      const wpId = parseInt(item['wp:post_id']);
      const title = getString(item.title) || 'Untitled';
      const content = getString(item['content:encoded']) || '';
      const excerpt = getString(item['excerpt:encoded']);
      const slug = getString(item['wp:post_name']) || `post-${wpId}`;
      const publishedAt = new Date(getString(item.pubDate) || new Date());
      const authorSlug = getString(item['dc:creator']);

      let authorId = null;
      if (authorSlug) {
        const author = await prisma.author.findUnique({ where: { slug: authorSlug } });
        if (author) authorId = author.id;
      }

      const categoriesList = item.category || [];
      const catArray = Array.isArray(categoriesList) ? categoriesList : [categoriesList];

      const categoriesConnect: { id: string }[] = [];
      for (const catItem of catArray) {
        const catSlug = getString(catItem['@_nicename']);
        const catName = getString(catItem['__cdata'] ?? catItem) || catSlug;
        if (!catSlug) continue;
        const dbCat = await ensureCategory(catSlug, catName || catSlug);
        if (dbCat) categoriesConnect.push({ id: dbCat.id });
      }

      try {
        await prisma.article.upsert({
          where: { slug },
          update: { title, content, excerpt, publishedAt, authorId, categories: { set: categoriesConnect } },
          create: { wpId, title, slug, content, excerpt, publishedAt, authorId, categories: { connect: categoriesConnect }, isPremium: false }
        });
        count++;
      } catch (e: any) {
        errors++;
        log.push(`Error: ${slug} - ${e.message}`);
      }
    }

    log.push(`Articles imported: ${count}/${articles.length} | Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      imported: count,
      errors,
      total: articles.length,
      log
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
