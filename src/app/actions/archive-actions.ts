"use server";

import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 24;

export interface ArchiveFilters {
  query?: string;
  categoryId?: string;
  year?: number;
  thematicId?: string; // parent category
  tagSlug?: string;   // personalisation
  page?: number;
}

export interface ArchiveFilterOptions {
  categories: { id: string; name: string; slug: string; parentId: string | null }[];
  years: number[];
  tags: { id: string; name: string; slug: string }[];
}

export async function getArchiveFilterOptions(): Promise<ArchiveFilterOptions> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [categories, tags, earliestArticle] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.article.findFirst({
      where: { publishedAt: { not: null, lte: oneYearAgo } },
      orderBy: { publishedAt: "asc" },
      select: { publishedAt: true },
    }),
  ]);

  const maxArchiveYear = oneYearAgo.getFullYear();
  const earliestYear = earliestArticle?.publishedAt
    ? new Date(earliestArticle.publishedAt).getFullYear()
    : maxArchiveYear;

  const years: number[] = [];
  for (let y = maxArchiveYear; y >= earliestYear; y--) {
    years.push(y);
  }

  return { categories, years, tags };
}

export async function getFilteredArticles(filters: ArchiveFilters) {
  const page = filters.page ?? 1;
  const skip = (page - 1) * PAGE_SIZE;

  const categoryFilter =
    filters.categoryId
      ? { categories: { some: { id: filters.categoryId } } }
      : filters.thematicId
      ? { categories: { some: { OR: [{ id: filters.thematicId }, { parentId: filters.thematicId }] } } }
      : {};

  const tagFilter = filters.tagSlug
    ? { tags: { some: { slug: filters.tagSlug } } }
    : {};

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let yearFilter: any = { publishedAt: { not: null, lte: oneYearAgo } };

  if (filters.year) {
    const yearStart = new Date(`${filters.year}-01-01`);
    const yearEnd = new Date(`${filters.year + 1}-01-01`);
    const effectiveEnd = yearEnd < oneYearAgo ? yearEnd : oneYearAgo;

    yearFilter = {
      publishedAt: {
        gte: yearStart,
        lt: effectiveEnd,
      },
    };
  }

  const searchFilter = filters.query
    ? {
        OR: [
          { title: { contains: filters.query } },
          { excerpt: { contains: filters.query } },
        ],
      }
    : {};

  const where = {
    ...yearFilter,
    ...categoryFilter,
    ...tagFilter,
    ...searchFilter,
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { categories: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    articles,
    total,
    page,
    pageSize: PAGE_SIZE,
    hasMore: skip + articles.length < total,
  };
}
