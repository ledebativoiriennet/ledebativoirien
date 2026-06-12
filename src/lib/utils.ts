export function extractFirstImageUrl(htmlContent: string | null | undefined): string | null {
  if (!htmlContent) return null;
  // Amélioration de la regex pour supporter les simples/doubles quotes et ne pas échouer sur de longs base64
  const match = htmlContent.match(/<img[^>]*?src=["']([^"']+)["']/i);
  if (!match) return null;
  let url = match[1];
  
  // Clean old wordpress domain to current production domain
  if (url.includes("ledebativoirien.africanewsquick.net")) {
    url = url.replace("http://ledebativoirien.africanewsquick.net", "https://ledebativoirien.net");
    url = url.replace("https://ledebativoirien.africanewsquick.net", "https://ledebativoirien.net");
  }
  return url;
}

export function getArticleImage(article: { imageUrl?: string | null, content?: string | null }): string {
  if (!article) return "/default-article.png";
  let url = article.imageUrl;
  if (!url) {
    url = extractFirstImageUrl(article.content);
  }
  if (!url) return "/default-article.png";

  // Clean old wordpress domain to current production domain
  if (url.includes("ledebativoirien.africanewsquick.net")) {
    url = url.replace("http://ledebativoirien.africanewsquick.net", "https://ledebativoirien.net");
    url = url.replace("https://ledebativoirien.africanewsquick.net", "https://ledebativoirien.net");
  }

  return url;
}

