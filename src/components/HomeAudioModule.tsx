"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface AudioArticle {
  id: string;
  title: string;
  content: string;
  slug: string;
  imageUrl?: string | null;
  categoryName?: string;
}

export default function HomeAudioModule({ articles }: { articles: AudioArticle[] }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const extractText = (html: string) => {
    if (typeof window === 'undefined') return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const togglePlay = (article: AudioArticle) => {
    if (!synth) return;

    if (playingId === article.id) {
      if (isPlaying) {
        synth.pause();
        setIsPlaying(false);
      } else {
        synth.resume();
        setIsPlaying(true);
      }
    } else {
      synth.cancel(); // Stop current
      const text = extractText(article.content);
      // Limit to first 3000 characters to avoid infinite reading if article is too long
      const textToRead = `${article.title}. ${text}`.substring(0, 3000); 
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      
      utterance.onend = () => {
        setPlayingId(null);
        setIsPlaying(false);
      };
      
      // Manege errors
      utterance.onerror = () => {
         setPlayingId(null);
         setIsPlaying(false);
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
      setPlayingId(article.id);
      setIsPlaying(true);
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section style={{ backgroundColor: '#0f172a', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative background element */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,26,36,0.15) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--primary)', borderRadius: '50%', animation: isPlaying ? 'pulse 1.5s infinite' : 'none' }}></div>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>LDI Podcasts</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.1 }}>L'Actu Audio</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '300px', textAlign: 'right', display: 'none' }} className="xl:block">
            Écoutez l'essentiel de l'actualité avec notre lecteur vocal intelligent.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {articles.map((article) => {
            const isThisPlaying = playingId === article.id;

            return (
              <div key={article.id} style={{ 
                backgroundColor: isThisPlaying ? 'rgba(255,255,255,0.1)' : 'rgba(30,41,59,0.5)', 
                border: `1px solid ${isThisPlaying ? 'rgba(236,26,36,0.3)' : 'rgba(255,255,255,0.05)'}`, 
                borderRadius: '16px', 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: isThisPlaying ? '0 10px 25px -5px rgba(236,26,36,0.1)' : 'none'
              }} className="hover-scale">
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)' }}>
                    {article.imageUrl ? (
                      <img src={article.imageUrl} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isThisPlaying ? 0.8 : 1 }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #334155, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>LDI</div>
                    )}
                    
                    {/* Audio Equalizer overlay when playing */}
                    {isThisPlaying && isPlaying && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ 
                            width: '4px', 
                            height: '24px', 
                            backgroundColor: 'white', 
                            borderRadius: '2px',
                            animation: `bounce ${0.5 + Math.random() * 0.5}s infinite alternate ease-in-out`,
                            animationDelay: `${Math.random() * 0.5}s`
                          }}></div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                      {article.categoryName || "Actualité"}
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.title}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <Link href={`/article/${article.slug}`} style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.2s' }}>
                    Lire l'article
                  </Link>
                  
                  <button 
                    onClick={() => togglePlay(article)}
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      backgroundColor: isThisPlaying ? 'var(--primary)' : 'white', 
                      color: isThisPlaying ? 'white' : '#0f172a', 
                      border: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s',
                      transform: isThisPlaying && isPlaying ? 'scale(1.05)' : 'scale(1)'
                    }}
                    aria-label={isThisPlaying && isPlaying ? "Pause" : "Play"}
                  >
                    {isThisPlaying && isPlaying ? (
                      // Pause Icon
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '4px', height: '16px', backgroundColor: 'currentColor', borderRadius: '2px' }}></div>
                        <div style={{ width: '4px', height: '16px', backgroundColor: 'currentColor', borderRadius: '2px' }}></div>
                      </div>
                    ) : (
                      // Play Icon
                      <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '12px solid currentColor', marginLeft: '4px' }}></div>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0% { height: 8px; }
          100% { height: 24px; }
        }
      `}} />
    </section>
  );
}
