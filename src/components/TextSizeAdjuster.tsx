"use client";

import React, { useEffect, useState } from 'react';

export default function TextSizeAdjuster() {
  const [fontSize, setFontSize] = useState<number>(18); // Default font size 18px

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('ldi_font_size');
    if (saved) {
      setFontSize(parseInt(saved, 10));
    }
  }, []);

  useEffect(() => {
    // Apply font size to a CSS variable on the root or article container
    document.documentElement.style.setProperty('--article-font-size', `${fontSize}px`);
    localStorage.setItem('ldi_font_size', fontSize.toString());
  }, [fontSize]);

  const increase = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decrease = () => setFontSize(prev => Math.max(prev - 2, 14));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.2rem' }}>
      <button 
        onClick={decrease}
        style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--foreground)' }}
        title="Réduire le texte"
        aria-label="Réduire le texte"
      >
        A-
      </button>
      <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
      <button 
        onClick={increase}
        style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--foreground)' }}
        title="Agrandir le texte"
        aria-label="Agrandir le texte"
      >
        A+
      </button>
    </div>
  );
}
