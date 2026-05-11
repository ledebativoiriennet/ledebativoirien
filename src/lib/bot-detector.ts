/**
 * Utility to detect bots from User-Agent strings.
 */

export interface BotInfo {
  isBot: boolean;
  name?: string;
  category?: 'GOOD' | 'BAD';
}

const GOOD_BOTS = [
  { pattern: /googlebot/i, name: 'Googlebot' },
  { pattern: /bingbot/i, name: 'Bingbot' },
  { pattern: /slurp/i, name: 'Yahoo! Slurp' },
  { pattern: /duckduckbot/i, name: 'DuckDuckBot' },
  { pattern: /baiduspider/i, name: 'Baiduspider' },
  { pattern: /yandexbot/i, name: 'YandexBot' },
  { pattern: /facebot/i, name: 'Facebook Bot' },
  { pattern: /ia_archiver/i, name: 'Alexa/Internet Archive' },
  { pattern: /twitterbot/i, name: 'Twitterbot' },
  { pattern: /linkedinbot/i, name: 'LinkedInBot' },
  { pattern: /applebot/i, name: 'Applebot' },
  { pattern: /discordbot/i, name: 'Discordbot' },
  { pattern: /whatsapp/i, name: 'WhatsApp Bot' },
  { pattern: /telegrambot/i, name: 'TelegramBot' },
];

const BAD_BOTS = [
  { pattern: /ahrefsbot/i, name: 'AhrefsBot' },
  { pattern: /semrushbot/i, name: 'SemrushBot' },
  { pattern: /mj12bot/i, name: 'MJ12bot' },
  { pattern: /dotbot/i, name: 'DotBot' },
  { pattern: /rogerbot/i, name: 'Rogerbot' },
  { pattern: /exabot/i, name: 'Exabot' },
  { pattern: /blexbot/i, name: 'BLEXBot' },
  { pattern: /seo-kicker/i, name: 'SEO-Kicker' },
  { pattern: /barkrowler/i, name: 'Barkrowler' },
  { pattern: /zoominfobot/i, name: 'ZoominfoBot' },
  { pattern: /petalbot/i, name: 'PetalBot' },
  { pattern: /commoncrawl/i, name: 'CommonCrawl' },
  { pattern: /ccbot/i, name: 'CCBot' },
  { pattern: /python-requests/i, name: 'Python Requests' },
  { pattern: /node-fetch/i, name: 'Node Fetch' },
  { pattern: /go-http-client/i, name: 'Go HTTP Client' },
  { pattern: /curl/i, name: 'cURL' },
  { pattern: /wget/i, name: 'Wget' },
  { pattern: /headless/i, name: 'Headless Browser' },
  { pattern: /selenium/i, name: 'Selenium' },
  { pattern: /puppeteer/i, name: 'Puppeteer' },
  { pattern: /playwright/i, name: 'Playwright' },
];

export function detectBot(userAgent: string): BotInfo {
  if (!userAgent) {
    return { isBot: true, name: 'Empty User-Agent', category: 'BAD' };
  }

  // Check Good Bots
  for (const bot of GOOD_BOTS) {
    if (bot.pattern.test(userAgent)) {
      return { isBot: true, name: bot.name, category: 'GOOD' };
    }
  }

  // Check Bad Bots
  for (const bot of BAD_BOTS) {
    if (bot.pattern.test(userAgent)) {
      return { isBot: true, name: bot.name, category: 'BAD' };
    }
  }

  // Generic bot indicators
  const genericBotPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /archiver/i,
    /scrape/i,
    /checker/i,
  ];

  for (const pattern of genericBotPatterns) {
    if (pattern.test(userAgent)) {
      return { isBot: true, name: 'Generic Bot', category: 'BAD' };
    }
  }

  return { isBot: false };
}

export function isBadBot(userAgent: string): boolean {
  const result = detectBot(userAgent);
  return result.isBot && result.category === 'BAD';
}
