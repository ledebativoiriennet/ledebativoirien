import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return new Response("La clé GEMINI_API_KEY n'est pas configurée.", { status: 500 });
    }

    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1];
    const query = latestMessage.content || (latestMessage.parts && latestMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')) || '';

    // Fetch relevant articles from Prisma (simple keyword search for context)
    const articles = await prisma.article.findMany({
      where: {
        publishedAt: { not: null, lte: new Date() },
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          { excerpt: { contains: query } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: { title: true, excerpt: true, slug: true, publishedAt: true },
    });

    const context = articles.map(a => 
      `Titre: ${a.title}\nDate: ${a.publishedAt?.toISOString()}\nLien: /article/${a.slug}\nExtrait: ${a.excerpt}`
    ).join("\n\n---\n\n");

    const systemPrompt = `Tu es l'assistant IA du site d'actualités "Le Débat Ivoirien".
Ton rôle est de répondre aux questions des lecteurs en faisant une courte synthèse claire et précise des articles trouvés.
Voici les articles pertinents trouvés pour la requête de l'utilisateur :

${context ? context : "Aucun article pertinent n'a été trouvé pour cette recherche dans nos bases."}

Instructions:
1. Base-toi UNIQUEMENT sur les articles ci-dessus pour répondre.
2. Si la réponse n'est pas dans les articles, dis poliment que tu n'as pas trouvé l'information dans les publications récentes du site. Ne cherche pas sur internet ou dans tes connaissances générales.
3. Fais des réponses concises et structurées (2 à 4 paragraphes).
4. Ajoute toujours à la fin de ta réponse les sources que tu as utilisées, sous forme de liens markdown : "[Titre de l'article](/article/slug-de-l-article)".`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Search Error:", error);
    return new Response("Une erreur est survenue lors du traitement IA.", { status: 500 });
  }
}
