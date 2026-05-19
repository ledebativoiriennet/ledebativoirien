import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import { headers } from "next/headers";
import crypto from "crypto";
import SearchResultList from "@/components/SearchResultList";

export const metadata: Metadata = {
  title: "Résultats de recherche - Le Débat Ivoirien",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;

  if (!query) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>Recherche</h1>
        <p style={{ color: 'var(--muted)' }}>Veuillez saisir un mot-clé pour effectuer une recherche.</p>
      </div>
    );
  }

  // Enregistrer l'événement de recherche
  let searchEventId = "";
  try {
    const headersList = await headers();
    const ip = headersList.get("x-vercel-ip") || headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const todayStr = new Date().toISOString().split("T")[0];
    const ipHash = crypto.createHash("sha256").update(`${ip}-${query}-${todayStr}`).digest("hex");

    let searchEvent = await prisma.searchEvent.findFirst({
      where: { ipHash }
    });

    if (!searchEvent) {
      searchEvent = await prisma.searchEvent.create({
        data: {
          query,
          ipHash,
        }
      });
    }
    searchEventId = searchEvent.id;
  } catch (error) {
    console.error("Failed to log search event:", error);
  }

  const articles = await prisma.article.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { excerpt: { contains: query } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 40,
    include: { categories: true },
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', borderBottom: '4px solid var(--primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>
        Résultats pour : "{query}"
      </h1>
      
      <p style={{ marginBottom: '2rem', color: 'var(--muted)' }}>
        {articles.length} {articles.length > 1 ? 'articles trouvés' : 'article trouvé'}
      </p>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Aucun résultat trouvé</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>Désolé, nous n'avons trouvé aucun article correspondant à votre recherche.</p>
          <Link href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            Retour à l'accueil
          </Link>
        </div>
      ) : (
        <SearchResultList articles={articles} searchEventId={searchEventId} />
      )}
    </div>
  );
}
