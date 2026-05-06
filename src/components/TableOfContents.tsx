"use client";

import React, { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // On attend un court instant que l'article soit rendu et que le contenu HTML soit inséré
    const timer = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('.article-content h2, .article-content h3')) as HTMLElement[];
      
      const items: TocItem[] = elements.map((el, index) => {
        let id = el.id;
        if (!id) {
          // Si la balise n'a pas d'ID, on en génère un pour permettre l'ancre
          id = `heading-${index}-${el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          el.id = id;
        }
        return {
          id,
          text: el.textContent || '',
          level: el.tagName.toLowerCase() === 'h2' ? 2 : 3
        };
      });
      
      setHeadings(items);

      // Intersection Observer pour suivre la lecture
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      }, { rootMargin: '-10% 0px -80% 0px' }); // Déclenche quand l'élément est dans la partie supérieure de l'écran

      elements.forEach(el => observer.observe(el));

      return () => {
        elements.forEach(el => observer.unobserve(el));
      };
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (headings.length === 0) return null; // Ne rien afficher si l'article est court et sans sous-titres

  return (
    <div style={{ position: 'sticky', top: '120px', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', paddingRight: '1rem' }} className="hidden xl:block">
      <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 800, marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Dans cet article</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {headings.map(heading => (
          <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}>
            <a 
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(heading.id);
              }}
              style={{
                display: 'block',
                fontSize: '0.8rem',
                lineHeight: 1.4,
                color: activeId === heading.id ? 'var(--primary)' : 'var(--foreground)',
                fontWeight: activeId === heading.id ? 700 : 400,
                textDecoration: 'none',
                borderLeft: activeId === heading.id ? '2px solid var(--primary)' : '2px solid transparent',
                paddingLeft: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
