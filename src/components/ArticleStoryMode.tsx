"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import SafeImage from './SafeImage';

export default function ArticleStoryMode({ 
  title, 
  contentHtml, 
  imageUrl 
}: { 
  title: string, 
  contentHtml: string, 
  imageUrl?: string | null 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Extract paragraphs from HTML
  const slides = useMemo(() => {
    if (typeof window === 'undefined') return [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const paragraphs = Array.from(doc.querySelectorAll('p, h2, h3, blockquote, li'))
      .map(el => el.textContent?.trim() || "")
      .filter(text => text.length > 30); // Ignore very short fragments
      
    // Always add the title as the first slide
    return [title, ...paragraphs];
  }, [contentHtml, title]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setIsOpen(false);
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const screenWidth = window.innerWidth;
    let clientX = 0;
    
    if ('changedTouches' in e) {
      clientX = e.changedTouches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    if (clientX > screenWidth / 2) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  if (slides.length === 0) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          padding: '0.6rem 1.2rem',
          borderRadius: '9999px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          margin: '1rem 0'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>📱</span> Lire en mode Story
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'black',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Background Image */}
          {imageUrl && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              opacity: 0.3,
              zIndex: 1,
              filter: 'blur(10px) brightness(0.6)'
            }}>
              <SafeImage src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Progress Bars */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '10px',
            right: '10px',
            display: 'flex',
            gap: '4px',
            zIndex: 10
          }}>
            {slides.map((_, index) => (
              <div key={index} style={{
                flex: 1,
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: 'white',
                  width: index < currentSlide ? '100%' : index === currentSlide ? '100%' : '0%',
                  transition: index === currentSlide ? 'width 0s' : 'none'
                }} />
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '35px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              zIndex: 10,
              cursor: 'pointer',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >×</button>

          {/* Content Area (Clickable) */}
          <div 
            onClick={handleTouchEnd}
            style={{
              flex: 1,
              position: 'relative',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'pointer'
            }}
          >
            <div style={{
              color: 'white',
              fontSize: currentSlide === 0 ? '2.5rem' : '1.5rem',
              fontWeight: currentSlide === 0 ? 900 : 500,
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              lineHeight: 1.4,
              maxWidth: '800px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              {slides[currentSlide]}
            </div>
          </div>

          {/* Touch instructions */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8rem',
            zIndex: 5,
            pointerEvents: 'none'
          }}>
            Tapotez à droite pour la suite, à gauche pour revenir
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
