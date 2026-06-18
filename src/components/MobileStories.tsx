"use client";

import { useState, useEffect } from "react";

export interface Story {
  id: string;
  content: string;
  createdAt: Date;
}

export interface StoryGroup {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  stories: Story[];
}

export default function MobileStories({ groups }: { groups: StoryGroup[] }) {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const activeGroup = activeGroupIndex !== null ? groups[activeGroupIndex] : null;
  const currentStories = activeGroup ? activeGroup.stories : [];

  useEffect(() => {
    if (activeGroupIndex === null) return;
    
    // Prevent body scroll when open
    document.body.style.overflow = 'hidden';
    
    setProgress(0);
    const duration = 6000; // 6 seconds per story
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;
    
    const interval = setInterval(() => {
      setProgress(p => {
        if (p + increment >= 100) {
          setTimeout(() => {
            if (activeStoryIndex < currentStories.length - 1) {
              setActiveStoryIndex(activeStoryIndex + 1);
            } else {
              // End of group
              setActiveGroupIndex(null);
            }
          }, 0);
          return 100;
        }
        return p + increment;
      });
    }, intervalTime);
    
    return () => {
      clearInterval(interval);
      document.body.style.overflow = 'auto';
    };
  }, [activeGroupIndex, activeStoryIndex, currentStories.length]);

  if (!groups || groups.length === 0) return null;

  return (
    <>
      <div className="mobile-stories-container" style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        overflowX: 'auto',
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        scrollbarWidth: 'none',
      }}>
        <style>{`
          .mobile-stories-container::-webkit-scrollbar { display: none; }
          .story-bubble {
            flex-shrink: 0;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            padding: 3px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
          }
          .story-bubble:active { transform: scale(0.95); }
          .story-bubble-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: var(--background);
            border: 2px solid var(--background);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--foreground);
            font-weight: 900;
            overflow: hidden;
            flex-direction: column;
            line-height: 1;
          }
        `}</style>
        
        {groups.map((group, i) => (
          <div key={group.id} className="story-bubble" style={{ background: group.gradient }} onClick={() => { setActiveGroupIndex(i); setActiveStoryIndex(0); }}>
            <div className="story-bubble-inner">
              <span style={{ fontSize: '1.2rem' }}>{group.icon}</span>
              <span style={{ fontSize: '0.5rem', marginTop: '4px', textTransform: 'uppercase' }}>{group.label}</span>
            </div>
          </div>
        ))}
      </div>

      {activeGroupIndex !== null && activeGroup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#0f172a',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
        }}>
          {/* Progress Bars */}
          <div style={{ display: 'flex', gap: '4px', padding: '1rem 0.5rem', paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
            {currentStories.map((_, i) => (
              <div key={i} style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  backgroundColor: 'white',
                  width: i < activeStoryIndex ? '100%' : i === activeStoryIndex ? `${progress}%` : '0%',
                  transition: i === activeStoryIndex ? 'width 50ms linear' : 'none'
                }} />
              </div>
            ))}
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activeGroup.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'white', fontSize: '1rem' }}>
                {activeGroup.icon}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{activeGroup.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                  Aujourd'hui à {new Date(currentStories[activeStoryIndex].createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <button onClick={() => setActiveGroupIndex(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.75rem', cursor: 'pointer', padding: '0.5rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            zIndex: 10
          }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.3, marginBottom: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {currentStories[activeStoryIndex].content}
            </h2>
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              display: 'inline-block',
              alignSelf: 'center',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              Balayez pour continuer 👉
            </div>
          </div>

          {/* Invisible Touch Controls */}
          <div style={{ position: 'absolute', top: '10%', bottom: 0, left: 0, width: '30%', zIndex: 30 }} onClick={() => {
            if (activeStoryIndex > 0) { setActiveStoryIndex(activeStoryIndex - 1); setProgress(0); }
          }} />
          <div style={{ position: 'absolute', top: '10%', bottom: 0, right: 0, width: '70%', zIndex: 30 }} onClick={() => {
            if (activeStoryIndex < currentStories.length - 1) { setActiveStoryIndex(activeStoryIndex + 1); setProgress(0); }
            else setActiveGroupIndex(null);
          }} />
        </div>
      )}
    </>
  );
}
