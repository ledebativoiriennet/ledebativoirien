"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavBar() {
  const pathname = usePathname();

  const navItems = [
    { icon: '🏠', label: 'Accueil', href: '/' },
    { icon: '📰', label: 'Le Kiosque', href: '/marketplace' },
    { icon: '🔍', label: 'Recherche', href: '/recherche' },
    { icon: '👤', label: 'Profil', href: '/mon-compte' },
  ];

  return (
    <>
      <style>{`
        .bottom-nav-bar {
          display: none;
        }
        @media (max-width: 768px) {
          .bottom-nav-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--background);
            border-top: 1px solid var(--border);
            z-index: 9999;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
            justify-content: space-around;
            align-items: center;
            height: 60px;
          }
          
          /* Evite que le contenu soit caché derrière la barre */
          body {
            padding-bottom: calc(60px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
      <nav className="bottom-nav-bar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                color: isActive ? 'var(--primary)' : 'var(--foreground)',
                textDecoration: 'none',
                opacity: isActive ? 1 : 0.6,
                minWidth: '44px',
                minHeight: '44px',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '1.4rem', marginBottom: '2px', filter: isActive ? 'grayscale(0%)' : 'grayscale(100%)' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 700 : 500 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
