import webpush from 'web-push';
import { prisma } from './prisma';

// Configure VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contact@ledebativoirien.net',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification(articleId: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { title: true, excerpt: true, slug: true }
    });

    if (!article) return;

    const subscriptions = await prisma.pushSubscription.findMany();

    const payload = JSON.stringify({
      title: `🚨 ${article.title}`,
      body: article.excerpt || "Découvrez notre nouvel article exclusif.",
      url: `/article/${article.slug}`
    });

    const notifications = subscriptions.map(sub => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      return webpush.sendNotification(pushSubscription, payload).catch(err => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log('Subscription expired or no longer valid:', sub.endpoint);
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error('Error sending push notification:', err);
      });
    });

    await Promise.all(notifications);
    console.log(`Push notifications sent to ${subscriptions.length} subscribers.`);
  } catch (error) {
    console.error('sendPushNotification error:', error);
  }
}
