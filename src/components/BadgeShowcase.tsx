"use client";

import React, { useState } from 'react';

const BADGE_DEFINITIONS: Record<string, { title: string, icon: string, description: string, color: string }> = {
  'pioneer': { title: 'Pionnier', icon: '🚀', description: 'Membre depuis le lancement officiel', color: '#3b82f6' },
  'commentator': { title: 'Grand Orateur', icon: '🗣️', description: 'A participé à plus de 10 débats', color: '#10b981' },
  'reader_100': { title: 'Lecteur Assidu', icon: '📚', description: 'A lu 100 articles sur la plateforme', color: '#8b5cf6' },
  'premium_gold': { title: 'Abonné Or', icon: '👑', description: 'Abonné Premium 1 an', color: '#eab308' },
  'gifter': { title: 'Généreux', icon: '🎁', description: 'A partagé 5 articles cadeaux', color: '#ec4899' }
};

interface Props {
  badgesStr: string | null;
}

export default function BadgeShowcase({ badgesStr }: Props) {
  let userBadges: string[] = [];
  try {
    userBadges = badgesStr ? JSON.parse(badgesStr) : [];
  } catch (e) {
    userBadges = [];
  }

  // Si l'utilisateur n'a pas encore de badge, affichons les badges grisés
  const allBadgeIds = Object.keys(BADGE_DEFINITIONS);

  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🏆 Mes Trophées
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {allBadgeIds.map(badgeId => {
          const isEarned = userBadges.includes(badgeId);
          const badgeDef = BADGE_DEFINITIONS[badgeId];

          return (
            <div 
              key={badgeId}
              onMouseEnter={() => setHoveredBadge(badgeId)}
              onMouseLeave={() => setHoveredBadge(null)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: isEarned ? `${badgeDef.color}15` : '#f1f5f9',
                border: `2px solid ${isEarned ? badgeDef.color : '#e2e8f0'}`,
                opacity: isEarned ? 1 : 0.4,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isEarned ? `0 0 10px ${badgeDef.color}40` : 'none',
                filter: isEarned ? 'none' : 'grayscale(100%)'
              }}
            >
              <span style={{ fontSize: '2rem' }}>{badgeDef.icon}</span>
              
              {hoveredBadge === badgeId && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  width: '180px',
                  textAlign: 'center',
                  zIndex: 20,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem', color: isEarned ? badgeDef.color : '#cbd5e1' }}>
                    {badgeDef.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {badgeDef.description}
                  </div>
                  {!isEarned && (
                     <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginTop: '0.3rem', color: '#f87171' }}>🔒 À débloquer</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
