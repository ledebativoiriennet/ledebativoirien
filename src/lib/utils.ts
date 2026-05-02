export function extractFirstImageUrl(htmlContent: string | null | undefined): string | null {
  if (!htmlContent) return null;
  // Amélioration de la regex pour supporter les simples/doubles quotes et ne pas échouer sur de longs base64
  const match = htmlContent.match(/<img[^>]*?src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export function getArticleImage(article: { imageUrl?: string | null, content?: string | null }): string | null {
  if (!article) return null;
  if (article.imageUrl) return article.imageUrl;
  return extractFirstImageUrl(article.content);
}
