"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FlashNews {
  id: string;
  content: string;
  time: string;
  link: string | null;
  createdAt: Date;
  region: string | null;
}

export default function FlashNewsStoryViewer({ flashNews }: { flashNews: FlashNews[] }) {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStoryIndex !== null) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 50); // 100 * 50ms = 5s per story
    }
    return () => clearInterval(interval);
  }, [activeStoryIndex]);

  const handleNext = () => {
    if (activeStoryIndex !== null && activeStoryIndex < flashNews.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setProgress(0);
    } else {
      setActiveStoryIndex(null);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setProgress(0);
    }
  };

  if (!flashNews || flashNews.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
      <div className="container">
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
          STORIES À LA UNE
        </h2>
        
        {/* Story Bubbles */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {flashNews.map((flash, idx) => (
            <div 
              key={flash.id} 
              onClick={() => { setActiveStoryIndex(idx); setProgress(0); }}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '70px', flexShrink: 0 }}
            >
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'linear-gradient(45deg, #f59e0b, #ef4444, #a21caf)', 
                padding: '3px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '50%', 
                  backgroundColor: 'var(--background)', border: '2px solid var(--background)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 900, color: 'var(--foreground)'
                }}>
                  LDI
                </div>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {flash.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ width: '100%', maxWidth: '400px', height: '100%', maxHeight: '800px', position: 'relative', backgroundColor: '#111', display: 'flex', flexDirection: 'column' }}>
            
            {/* Progress Bars */}
            <div style={{ display: 'flex', gap: '0.2rem', padding: '1rem', position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10 }}>
              {flashNews.map((_, i) => (
                <div key={i} style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', backgroundColor: '#fff', 
                    width: i === activeStoryIndex ? `${progress}%` : i < activeStoryIndex ? '100%' : '0%' 
                  }} />
                </div>
              ))}
            </div>

            {/* Header */}
            <div style={{ position: 'absolute', top: '2rem', left: 0, width: '100%', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>LDI</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Le Débat Ivoirien</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{flashNews[activeStoryIndex].time} {flashNews[activeStoryIndex].region ? `• ${flashNews[activeStoryIndex].region}` : ''}</div>
                </div>
              </div>
              <button onClick={() => setActiveStoryIndex(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* Tap Areas */}
            <div onClick={handlePrev} style={{ position: 'absolute', top: '10%', left: 0, width: '30%', height: '80%', zIndex: 5, cursor: 'pointer' }} />
            <div onClick={handleNext} style={{ position: 'absolute', top: '10%', right: 0, width: '70%', height: '80%', zIndex: 5, cursor: 'pointer' }} />

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.4, marginBottom: '2rem' }}>
                  {flashNews[activeStoryIndex].content}
                </p>
                {flashNews[activeStoryIndex].link && (
                  <Link href={flashNews[activeStoryIndex].link!} style={{ position: 'relative', zIndex: 15, display: 'inline-block', backgroundColor: '#ef4444', color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none' }}>
                    Lire l'article complet
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
