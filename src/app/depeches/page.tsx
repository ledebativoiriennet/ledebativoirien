import React from 'react';
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import MainNavigation from "@/components/MainNavigation";

// Seuil de fraîcheur : 4 heures en millisecondes
const RECENT_THRESHOLD_MS = 4 * 60 * 60 * 1000;

export const metadata = {
  title: "Flash Infos / Dépêches - Le Débat Ivoirien",
  description: "Toutes les alertes et flash d'information de Côte d'Ivoire et d'ailleurs. Suivez l'actualité en temps réel avec Le Débat Ivoirien."
};

export const revalidate = 60;

// Groupe les dépêches par date (format: "Vendredi 15 mai 2026")
function groupByDate(items: { id: string; content: string; link: string | null; createdAt: Date }[]) {
  const groups: Record<string, typeof items> = {};
  for (const item of items) {
    const date = new Date(item.createdAt);
    const label = date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    // Capitalise la première lettre
    const key = label.charAt(0).toUpperCase() + label.slice(1);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export default async function DepechesPage() {
  const depeches = await prisma.flashNews.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const grouped = groupByDate(depeches);
  const dateKeys = Object.keys(grouped);

  return (
    <>
      <MainNavigation categories={[]} />

      <style dangerouslySetInnerHTML={{ __html: `
        .flash-page {
          background: #f5f5f5;
          min-height: 100vh;
          padding: 0 0 4rem;
          font-family: 'Arial', sans-serif;
        }

        /* Breadcrumb */
        .flash-breadcrumb {
          background: #fff;
          border-bottom: 1px solid #ddd;
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          color: #555;
        }
        .flash-breadcrumb a {
          color: #c00;
          text-decoration: none;
        }
        .flash-breadcrumb a:hover { text-decoration: underline; }
        .flash-breadcrumb span { margin: 0 0.4rem; color: #aaa; }

        /* Layout principal */
        .flash-layout {
          max-width: 1100px;
          margin: 1.5rem auto 0;
          padding: 0 1rem;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .flash-layout { grid-template-columns: 1fr; }
          .flash-sidebar { display: none; }
        }

        /* Bloc principal Flash Infos */
        .flash-main-block {
          background: #fff;
          border: 1px solid #ddd;
        }

        /* Header rouge type abidjan.net */
        .flash-header {
          background: #cc0000;
          color: #fff;
          padding: 0.55rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #aa0000;
        }
        .flash-header-title {
          font-size: 1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .flash-header-title::before {
          content: '';
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #fff;
          border-radius: 50%;
          animation: pulse-dot 1.5s infinite;
        }
        @keyframes pulse-dot {
          0%   { opacity: 1; transform: scale(1); }
          50%  { opacity: 0.4; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .flash-header-count {
          font-size: 0.75rem;
          background: rgba(255,255,255,0.2);
          padding: 0.2rem 0.55rem;
          border-radius: 20px;
          font-weight: 600;
        }

        /* Groupe de date */
        .flash-date-group { border-bottom: 1px solid #eee; }
        .flash-date-group:last-child { border-bottom: none; }

        .flash-date-label {
          background: #f8f8f8;
          border-bottom: 1px solid #e8e8e8;
          border-left: 3px solid #cc0000;
          padding: 0.45rem 1rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Items */
        .flash-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.6rem 1rem;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.15s ease;
        }
        .flash-item:last-child { border-bottom: none; }
        .flash-item:hover { background: #fef9f9; }

        /* Indicateur de fraîcheur */
        .flash-item--recent .flash-item-time { color: #cc0000; }
        .flash-item--recent .flash-item-bullet { background: #cc0000; }
        .flash-item--stale .flash-item-time { color: #aaa; }
        .flash-item--stale .flash-item-bullet { background: #ccc; }
        .flash-item--stale .flash-item-link { color: #666; }
        .flash-item--stale .flash-item-link:hover { color: #cc0000; }
        .flash-item--stale { background: #fafafa; }
        .flash-item--stale:hover { background: #f5f5f5; }

        .flash-item-time {
          flex-shrink: 0;
          min-width: 42px;
          font-size: 0.72rem;
          font-weight: 700;
          padding-top: 0.1rem;
          text-align: right;
          font-variant-numeric: tabular-nums;
          font-family: 'Arial Narrow', Arial, sans-serif;
        }

        .flash-item-bullet {
          flex-shrink: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-top: 0.45rem;
        }

        .flash-item-content {
          flex: 1;
          font-size: 0.88rem;
          line-height: 1.45;
          color: #1a1a1a;
          font-weight: 400;
        }
        .flash-item-link {
          color: #1a1a1a;
          text-decoration: none;
          display: block;
        }
        .flash-item-link:hover {
          color: #cc0000;
          text-decoration: none;
        }

        /* Empty state */
        .flash-empty {
          padding: 3rem 2rem;
          text-align: center;
          color: #888;
          font-size: 0.95rem;
        }

        /* ========== SIDEBAR ========== */
        .flash-sidebar {}

        .flash-sidebar-block {
          background: #fff;
          border: 1px solid #ddd;
          margin-bottom: 1.5rem;
        }
        .flash-sidebar-header {
          background: #333;
          color: #fff;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .flash-sidebar-body {
          padding: 0.75rem;
        }

        /* Bloc "À la une" dans la sidebar */
        .sidebar-article-item {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 0.8rem;
          line-height: 1.4;
          color: #222;
        }
        .sidebar-article-item:last-child { border-bottom: none; }
        .sidebar-article-item::before {
          content: '›';
          color: #cc0000;
          font-weight: 900;
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* Bloc RSS / abonnement */
        .flash-subscribe-box {
          background: linear-gradient(135deg, #cc0000, #990000);
          color: #fff;
          padding: 1rem;
          text-align: center;
          border-radius: 0;
        }
        .flash-subscribe-box h3 {
          font-size: 0.9rem;
          font-weight: 800;
          text-transform: uppercase;
          margin: 0 0 0.4rem;
          letter-spacing: 0.04em;
        }
        .flash-subscribe-box p {
          font-size: 0.78rem;
          margin: 0 0 0.75rem;
          opacity: 0.9;
          line-height: 1.4;
        }
        .flash-subscribe-btn {
          display: inline-block;
          background: #fff;
          color: #cc0000;
          font-weight: 800;
          font-size: 0.8rem;
          padding: 0.45rem 1.2rem;
          border-radius: 3px;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          transition: opacity 0.2s;
        }
        .flash-subscribe-btn:hover { opacity: 0.9; }

        /* Retour accueil */
        .flash-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #cc0000;
          font-size: 0.83rem;
          font-weight: 700;
          text-decoration: none;
          margin: 1rem 0 0;
          padding: 0.45rem 0;
        }
        .flash-back-link:hover { text-decoration: underline; }
      `}} />

      <div className="flash-page">
        {/* Fil d'Ariane */}
        <div className="flash-breadcrumb">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>Flash Infos / Dépêches</span>
        </div>

        <div className="flash-layout">
          {/* ======== COLONNE PRINCIPALE ======== */}
          <main>
            <div className="flash-main-block">
              {/* Header rouge */}
              <div className="flash-header">
                <div className="flash-header-title">
                  ⚡ Flash Infos / Dépêches
                </div>
                {depeches.length > 0 && (
                  <span className="flash-header-count">
                    {depeches.length} dépêche{depeches.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {depeches.length === 0 ? (
                <div className="flash-empty">
                  Aucune dépêche n&apos;est disponible pour le moment.
                </div>
              ) : (
                <>
                  {dateKeys.map((dateKey) => (
                    <div key={dateKey} className="flash-date-group">
                      {/* Label de date */}
                      <div className="flash-date-label">{dateKey}</div>

                      {/* Items du jour */}
                      {grouped[dateKey].map((item) => {
                        const itemDate = new Date(item.createdAt);
                        const isRecent = Date.now() - itemDate.getTime() < RECENT_THRESHOLD_MS;
                        const timeStr = itemDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={item.id}
                            className={`flash-item ${isRecent ? 'flash-item--recent' : 'flash-item--stale'}`}
                          >
                            <div className="flash-item-time">{timeStr}</div>
                            <div className="flash-item-bullet" />
                            <div className="flash-item-content">
                              {item.link ? (
                                <Link
                                  href={item.link}
                                  className="flash-item-link"
                                  target={item.link.startsWith('http') ? '_blank' : undefined}
                                  rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                >
                                  {item.content}
                                </Link>
                              ) : (
                                <span className="flash-item-link">{item.content}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>

            <Link href="/" className="flash-back-link">
              ← Retour à l&apos;accueil
            </Link>
          </main>

          {/* ======== SIDEBAR ======== */}
          <aside className="flash-sidebar">
            {/* Bloc abonnement SMS / Notifications */}
            <div className="flash-sidebar-block" style={{ marginBottom: '1.5rem' }}>
              <div className="flash-subscribe-box">
                <h3>📲 Restez informé</h3>
                <p>Recevez les Flash Infos en temps réel directement dans votre navigateur.</p>
                <Link href="/" className="flash-subscribe-btn">
                  S&apos;abonner
                </Link>
              </div>
            </div>

            {/* Bloc archives ou navigation */}
            <div className="flash-sidebar-block">
              <div className="flash-sidebar-header">📋 Navigation rapide</div>
              <div className="flash-sidebar-body">
                {dateKeys.slice(0, 10).map((dateKey) => (
                  <div key={dateKey} className="sidebar-article-item">
                    {dateKey} <span style={{ color: '#888', marginLeft: '0.3rem' }}>
                      ({grouped[dateKey].length})
                    </span>
                  </div>
                ))}
                {dateKeys.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#888', padding: '0.5rem 0' }}>
                    Aucune dépêche disponible.
                  </div>
                )}
              </div>
            </div>

            {/* Bloc liens utiles */}
            <div className="flash-sidebar-block" style={{ marginTop: '1.5rem' }}>
              <div className="flash-sidebar-header">🔗 Voir aussi</div>
              <div className="flash-sidebar-body">
                <div className="sidebar-article-item">
                  <Link href="/en-continu" style={{ color: '#222', textDecoration: 'none' }}>
                    Le Fil Info (Direct)
                  </Link>
                </div>
                <div className="sidebar-article-item">
                  <Link href="/" style={{ color: '#222', textDecoration: 'none' }}>
                    Toute l&apos;actualité
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
