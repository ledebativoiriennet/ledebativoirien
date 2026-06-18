import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, articleContext } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new Response("GEMINI_API_KEY is not set", { status: 500 });
    }

    const systemPrompt = `Tu es l'Assistant de Lecture "Copilote LDI" pour le journal "Le Débat Ivoirien".
Ton rôle est d'aider le lecteur à mieux comprendre l'article qu'il est en train de lire.
Réponds TOUJOURS de manière polie, claire et concise (pas plus de 3-4 paragraphes).
Base tes réponses UNIQUEMENT sur le contexte de l'article fourni ci-dessous. Si la question n'a aucun rapport avec l'article, dis poliment que ton rôle est d'expliquer cet article spécifique.

CONTEXTE DE L'ARTICLE ACTUEL :
${articleContext}
`;

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
      temperature: 0.3,
    });

    // Use toTextStreamResponse as suggested by TypeScript
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Copilot Error:", error);
    return new Response("Error generating response", { status: 500 });
  }
}
