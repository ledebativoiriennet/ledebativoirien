import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Rédaction - Le Débat Ivoirien",
  description: "Découvrez l'équipe de journalistes et d'éditorialistes du Débat Ivoirien.",
};

export default async function RedactionPage() {
  const team = await prisma.author.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { articles: true }
      }
    }
  });

  const getRoleLabel = (name: string) => {
    if (name.includes("Rédaction") || name.includes("Admin")) return "Direction de Rédaction";
    return "Journaliste / Reporter";
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '70vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--primary)' }}>La Rédaction</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', maxWidth: '800px', margin: '0 auto' }}>
          Une équipe de journalistes engagés pour une information de qualité, indépendante et rigoureuse sur la Côte d'Ivoire et l'Afrique.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem' }}>
        {team.map((member) => (
          <div key={member.id} style={{ textAlign: 'center', backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', transition: 'transform 0.2s' }} className="hover-scale">
            <div style={{ width: '120px', height: '120px', backgroundColor: '#f1f5f9', borderRadius: '50%', margin: '0 auto 1.5rem auto', overflow: 'hidden', border: '4px solid var(--primary)' }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>👤</div>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{member.name || "Anonyme"}</h2>
            <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {getRoleLabel(member.name)}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Passionné par l'information et le débat public en Côte d'Ivoire.
            </p>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '20px', display: 'inline-block' }}>
              {member._count.articles} {member._count.articles > 1 ? 'Articles publiés' : 'Article publié'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '5rem', padding: '3rem', backgroundColor: 'var(--foreground)', color: 'white', borderRadius: '16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Rejoignez notre équipe</h2>
        <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Vous êtes journaliste, blogueur ou expert et vous souhaitez contribuer au Débat Ivoirien ? Nous sommes toujours à la recherche de nouvelles voix.
        </p>
        <Link href="/contact" style={{ display: 'inline-block', backgroundColor: 'var(--primary)', color: 'white', padding: '0.8rem 2rem', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none' }}>
          Nous contacter
        </Link>
      </div>
    </div>
  );
}
