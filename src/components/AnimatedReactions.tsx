"use client";

import { useState } from 'react';

type Particle = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  rot: number;
  scale: number;
};

const REACTIONS = [
  { emoji: '👍', label: 'J\'aime' },
  { emoji: '❤️', label: 'J\'adore' },
  { emoji: '😮', label: 'Surpris' },
  { emoji: '👏', label: 'Bravo' },
  { emoji: '😡', label: 'En colère' },
];

export default function AnimatedReactions() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    '👍': 124, '❤️': 89, '😮': 12, '👏': 56, '😡': 3
  });

  const handleReaction = (emoji: string, e: React.MouseEvent<HTMLButtonElement>) => {
    // Increment counter locally
    setCounts(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }));

    // Get button position
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top;

    // Generate 8-12 particles
    const numParticles = Math.floor(Math.random() * 5) + 8;
    const newParticles: Particle[] = [];

    for (let i = 0; i < numParticles; i++) {
      newParticles.push({
        id: Date.now() + i,
        emoji,
        x: startX,
        y: startY,
        tx: (Math.random() - 0.5) * 200, // random x trajectory
        ty: - (Math.random() * 200 + 100), // always go up
        rot: Math.random() * 360,
        scale: Math.random() * 0.8 + 0.5
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1500);
  };

  return (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ width: '100%', marginBottom: '0.5rem', fontWeight: 800, fontSize: '1.1rem' }}>
          Réagissez à cet article
        </div>
        
        {REACTIONS.map((r) => (
          <button
            key={r.emoji}
            onClick={(e) => handleReaction(r.emoji, e)}
            className="reaction-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{r.emoji}</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--muted)' }}>{counts[r.emoji]}</span>
          </button>
        ))}
      </div>

      {/* Particles Container */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 99999 }}>
        {particles.map(p => (
          <div
            key={p.id}
            className="emoji-particle"
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              fontSize: '2rem',
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              '--rot': `${p.rot}deg`,
              '--scale': p.scale,
            } as any}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      <style>{`
        .reaction-btn:hover {
          transform: scale(1.1);
          background-color: var(--primary);
          color: white;
          border-color: var(--primary) !important;
        }
        .reaction-btn:hover span:last-child {
          color: white !important;
        }
        .reaction-btn:active {
          transform: scale(0.95);
        }

        .emoji-particle {
          animation: floatUp 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          opacity: 1;
        }

        @keyframes floatUp {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(var(--scale)) rotate(var(--rot));
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
