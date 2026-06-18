"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

type CommandItem = {
  id: string;
  title: string;
  icon: string;
  action: () => void;
  category: 'Navigation' | 'Actions' | 'Recherche';
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus input after a tiny delay for render
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const defaultCommands: CommandItem[] = [
    { id: 'home', title: 'Accueil', icon: '🏠', category: 'Navigation', action: () => router.push('/') },
    { id: 'kiosque', title: 'Le Kiosque (Journal PDF)', icon: '📰', category: 'Navigation', action: () => router.push('/marketplace') },
    { id: 'flash', title: 'Flash Infos en direct', icon: '⚡', category: 'Navigation', action: () => router.push('/depeches') },
    { id: 'theme-light', title: 'Activer le mode Clair', icon: '☀️', category: 'Actions', action: () => setTheme('light') },
    { id: 'theme-dark', title: 'Activer le mode Sombre', icon: '🌙', category: 'Actions', action: () => setTheme('dark') },
  ];

  const searchCommand: CommandItem[] = query.trim() ? [
    { 
      id: 'search', 
      title: `Rechercher "${query}" dans les articles...`, 
      icon: '🔍', 
      category: 'Recherche', 
      action: () => router.push(`/recherche?q=${encodeURIComponent(query)}`) 
    }
  ] : [];

  const filteredCommands = [...searchCommand, ...defaultCommands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()))];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="command-palette-backdrop"
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '10vh',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: 'var(--card-bg)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Input Area */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--muted)', marginRight: '1rem' }}>🔍</span>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Que cherchez-vous ? (Catégorie, Action, Article...)" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '1.2rem',
                color: 'var(--foreground)',
                width: '100%'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', backgroundColor: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>ESC</div>
          </div>

          {/* Results Area */}
          <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
            {filteredCommands.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Aucun résultat pour "{query}"
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <div 
                  key={cmd.id}
                  onClick={() => { cmd.action(); setIsOpen(false); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    gap: '1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: index === selectedIndex ? 'var(--primary)' : 'transparent',
                    color: index === selectedIndex ? 'white' : 'var(--foreground)',
                    transition: 'background-color 0.1s'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', filter: index === selectedIndex ? 'brightness(2)' : 'none' }}>{cmd.icon}</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cmd.title}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cmd.category}</span>
                  </div>
                  {index === selectedIndex && (
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>⏎</span>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--background)', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Utilisez <strong>↑ ↓</strong> pour naviguer, <strong>Entrée</strong> pour sélectionner.</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </>
  );
}
