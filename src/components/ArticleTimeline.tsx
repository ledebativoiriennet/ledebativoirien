"use client";

import React from 'react';
import Link from 'next/link';

interface TimelineEvent {
  id: string;
  title: string;
  slug: string;
  timelineEventDate: Date | null;
  publishedAt: Date | null;
}

interface ArticleTimelineProps {
  currentArticleId: string;
  timelineId: string;
  events: TimelineEvent[];
}

export default function ArticleTimeline({ currentArticleId, timelineId, events }: ArticleTimelineProps) {
  if (!events || events.length < 2) return null;

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.timelineEventDate || a.publishedAt || new Date(0);
    const dateB = b.timelineEventDate || b.publishedAt || new Date(0);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div style={{
      backgroundColor: '#fef3c7', // amber-50
      border: '1px solid #fcd34d', // amber-300
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        color: '#b45309', // amber-700
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        ⏳ Chronologie du Dossier
      </h3>
      
      <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
        <div style={{
          position: 'absolute',
          left: '0.45rem',
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: '#fcd34d' // amber-300
        }} />
        
        {sortedEvents.map((evt, index) => {
          const isCurrent = evt.id === currentArticleId;
          const dateToUse = evt.timelineEventDate || evt.publishedAt;
          
          return (
            <div key={evt.id} style={{ 
              position: 'relative', 
              marginBottom: index === sortedEvents.length - 1 ? 0 : '1.5rem' 
            }}>
              <div style={{
                position: 'absolute',
                left: '-1.5rem',
                top: '0.3rem',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isCurrent ? '#d97706' : '#fef3c7',
                border: `2px solid ${isCurrent ? '#d97706' : '#fcd34d'}`,
                transform: 'translateX(-2px)',
                zIndex: 1
              }} />
              
              <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700, marginBottom: '0.25rem' }}>
                {dateToUse ? new Date(dateToUse).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : 'Date inconnue'}
              </div>
              
              {isCurrent ? (
                <div style={{ fontWeight: 800, color: '#0f172a' }}>
                  {evt.title} (Vous êtes ici)
                </div>
              ) : (
                <Link href={`/article/${evt.slug}`} style={{ color: '#0369a1', textDecoration: 'none', fontWeight: 600 }} className="hover-underline">
                  {evt.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
