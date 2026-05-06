"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Props {
  title: string;
  content: string;
}

export default function ArticleAudioPlayer({ title, content }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isPlaying && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      // Start fresh
      // Strip HTML tags for clean reading
      const textToRead = title + ". " + content.replace(/<[^>]+>/g, ' ');
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '50px', width: 'fit-content', boxShadow: 'var(--shadow)' }}>
      <button 
        onClick={handlePlayPause}
        style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isPlaying && !isPaused ? (
          // Pause Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        ) : (
          // Play Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>
      
      {isPlaying && (
        <button onClick={handleStop} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Arrêter">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)' }}>
          {isPlaying && !isPaused ? 'Lecture en cours...' : 'Écouter l\'article'}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Généré automatiquement</span>
      </div>
    </div>
  );
}
