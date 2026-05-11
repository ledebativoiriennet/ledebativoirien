import { prisma } from "@/lib/prisma";

export async function publishToFacebook(articleId: string) {
  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

    if (!article || !settings || !settings.facebookAccessToken || !settings.facebookPageId) {
      console.warn("⚠️ Facebook publication skipped: Missing article, settings, or credentials.");
      return;
    }

    const message = `${article.title}\n\n${article.excerpt || ""}`;
    const link = `https://ledebativoirien.net/article/${article.slug}`;

    const response = await fetch(`https://graph.facebook.com/v19.0/${settings.facebookPageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        link,
        access_token: settings.facebookAccessToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Facebook API error");

    console.log("✅ Published to Facebook:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Error publishing to Facebook:", error);
  }
}

export async function publishToTwitter(articleId: string) {
  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

    if (!article || !settings || !settings.twitterApiKey || !settings.twitterAccessToken) {
      console.warn("⚠️ X (Twitter) publication skipped: Missing article, settings, or credentials.");
      return;
    }

    // Note: Twitter API v2 requires OAuth 1.0a or OAuth 2.0 PKCE.
    // For a simple implementation, we assume a library like twitter-api-v2 might be needed for signing.
    // Here we provide the structure.
    
    const text = `${article.title}\n\nhttps://ledebativoirien.net/article/${article.slug}`;

    // Placeholder for actual signing logic or using a library
    console.log("ℹ️ X (Twitter) publication triggered for:", article.title);
    
    // If we had twitter-api-v2:
    // const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
    // await client.v2.tweet(text);
    
    return { success: true, message: "Triggered (Requires OAuth signing logic)" };
  } catch (error) {
    console.error("❌ Error publishing to X:", error);
  }
}

export async function publishToLinkedIn(articleId: string) {
  try {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });

    if (!article || !settings || !settings.linkedinAccessToken || !settings.linkedinUrn) {
      console.warn("⚠️ LinkedIn publication skipped: Missing article, settings, or credentials.");
      return;
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.linkedinAccessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: settings.linkedinUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: `${article.title}\n\n${article.excerpt || ""}`,
            },
            shareMediaCategory: "ARTICLE",
            media: [
              {
                status: "READY",
                description: { text: article.excerpt || article.title },
                originalUrl: `https://ledebativoirien.net/article/${article.slug}`,
                title: { text: article.title },
              },
            ],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "LinkedIn API error");

    console.log("✅ Published to LinkedIn:", data.id);
    return data;
  } catch (error) {
    console.error("❌ Error publishing to LinkedIn:", error);
  }
}

export async function publishToAllSocials(articleId: string, platforms: { facebook?: boolean; twitter?: boolean; linkedin?: boolean }) {
  const results = [];
  if (platforms.facebook) results.push(publishToFacebook(articleId));
  if (platforms.twitter) results.push(publishToTwitter(articleId));
  if (platforms.linkedin) results.push(publishToLinkedIn(articleId));
  
  return Promise.all(results);
}
