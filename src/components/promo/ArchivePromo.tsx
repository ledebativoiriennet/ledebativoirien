'use client';
import Link from 'next/link';

export default function ArchivePromo() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        fontSize: '5rem',
        opacity: 0.1,
        transform: 'rotate(15deg)',
        pointerEvents: 'none'
      }}>🗂️</div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'inline-block', 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          padding: '0.2rem 0.6rem', 
          borderRadius: '4px', 
          fontSize: '0.65rem', 
          fontWeight: 900, 
          textTransform: 'uppercase',
          marginBottom: '0.75rem'
        }}>
          Nouveau
        </div>
        
        <h3 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 900, 
          lineHeight: 1.2, 
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Explorez les Archives
        </h3>
        
        <p style={{ 
          fontSize: '0.85rem', 
          color: '#94a3b8', 
          lineHeight: 1.5, 
          marginBottom: '1.25rem' 
        }}>
          Recherchez parmi des milliers d'articles classés par thématique et année.
        </p>
        
        <Link 
          href="/archives" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'white',
            color: '#0f172a',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            transition: 'transform 0.2s'
          }}
          className="hover-scale"
        >
          Accéder au moteur 🔍
        </Link>
      </div>
    </div>
  );
}
