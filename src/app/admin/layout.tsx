import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/admin");
  }

  // Vérifier le rôle directement en base de données pour éviter les problèmes de cache (JWT)
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { role: true }
  });

  const role = dbUser?.role || "USER";
  if (role !== "ADMIN" && role !== "EDITOR") {
    redirect("/"); // Accès refusé
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.05em' }}>LeDébat<span style={{ color: 'var(--primary)' }}>Admin</span></h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Espace {role}</p>
        </div>
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/admin" style={{ padding: '0.75rem 1rem', borderRadius: '4px', textDecoration: 'none', color: '#cbd5e1', fontWeight: 'bold', transition: 'all 0.2s' }}>📊 Tableau de bord</Link>
          <Link href="/admin/articles" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>📝 Articles</Link>
          <Link href="/admin/breaking-news" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>🚨 Breaking News</Link>
          <Link href="/admin/flash-news" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>⚡ Flash Infos</Link>
          <Link href="/admin/titrologie" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>📰 Titrologie</Link>
          <Link href="/admin/sondages" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>📊 Sondages</Link>
          <Link href="/admin/agenda" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>📅 Agenda</Link>
          <Link href="/admin/citations" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>💬 Citations</Link>
          <Link href="/admin/necrologie" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>✝️ Nécrologie</Link>
          <Link href="/admin/emplois" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>💼 Emplois</Link>
          <Link href="/admin/communiques" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>📢 Communiqués</Link>
          <Link href="/admin/meteo" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>⛅ Météo</Link>
          <Link href="/admin/sports" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>⚽ Sports</Link>
          <Link href="/admin/reseaux-sociaux" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s' }}>🔗 Réseaux Sociaux</Link>
          <Link href="/admin/marketplace" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', border: '1px solid #dc2626', marginTop: '0.5rem', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>🛒 Kiosque PDF</Link>
          <Link href="/admin/publicites" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', border: '1px solid #3b82f6', marginTop: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>📢 Régie Publicitaire</Link>
          {role === 'ADMIN' && (
            <>
              <Link href="/admin/equipe" style={{ padding: '0.75rem 1rem', borderRadius: '4px', textDecoration: 'none', color: '#cbd5e1', fontWeight: 'bold', transition: 'all 0.2s' }}>🛡️ Équipe</Link>
              <Link href="/admin/users" style={{ padding: '0.75rem 1rem', borderRadius: '4px', textDecoration: 'none', color: '#cbd5e1', fontWeight: 'bold', transition: 'all 0.2s' }}>👥 Lecteurs & Abonnés</Link>
              <Link href="/admin/newsletter" style={{ padding: '0.75rem 1rem', borderRadius: '4px', textDecoration: 'none', color: '#cbd5e1', fontWeight: 'bold', transition: 'all 0.2s' }}>✉️ Newsletter</Link>
              <Link href="/admin/leads" style={{ padding: '0.75rem 1rem', borderRadius: '4px', textDecoration: 'none', color: '#cbd5e1', fontWeight: 'bold', transition: 'all 0.2s' }}>💼 Leads Annonceurs</Link>
            </>
          )}
          <Link href="/admin/parametres" style={{ display: 'block', padding: '0.75rem', borderRadius: '8px', color: '#cbd5e1', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', border: '1px solid #475569', marginTop: '0.5rem', backgroundColor: 'rgba(71, 85, 105, 0.2)' }}>⚙️ Paramètres</Link>
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid #334155' }}>
          <Link href="/" style={{ display: 'block', padding: '0.75rem', textAlign: 'center', backgroundColor: '#334155', borderRadius: '4px', color: 'white', textDecoration: 'none', fontSize: '0.85rem' }}>
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
