"use client";

import { useState } from "react";

const VIDEOS_PER_PAGE = 4;

export default function WebTVModule({ videos }: { videos: any[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  if (!videos || videos.length === 0) return null;

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const pageVideos = videos.slice(startIndex, startIndex + VIDEOS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setPlayingId(null);
  };

  return (
    <section style={{ backgroundColor: '#1e293b', color: 'white', padding: '3rem 0' }}>
      <div className="container">
        <h2 className="portal-section-title" style={{ backgroundColor: 'transparent', borderBottom: '2px solid var(--primary)', padding: '0 0 0.5rem 0', display: 'inline-block' }}>Web TV LDI - En Vidéo</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {pageVideos.map((vid) => (
            <div key={`video-${vid.id}`} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", cursor: playingId === vid.id ? "default" : "pointer" }} onClick={() => setPlayingId(vid.id)}>
              <div style={{ aspectRatio: "16/9", backgroundColor: "black", position: "relative", borderRadius: "4px", overflow: "hidden", transform: 'translateZ(0)' }}>
                {playingId === vid.id ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${vid.youtubeId}?autoplay=1`}
                    title={vid.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  ></iframe>
                ) : (
                  <>
                    <img src={`https://img.youtube.com/vi/${vid.youtubeId}/maxresdefault.jpg`} alt={vid.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.2rem", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" }}>
                      ▶
                    </div>
                  </>
                )}
              </div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>{vid.title}</h3>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
            >
              ← Précédent
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '6px',
                  border: page === currentPage ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: page === currentPage ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: page === currentPage ? 700 : 400,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
              }}
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

