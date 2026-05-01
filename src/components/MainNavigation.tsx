"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface MainNavigationProps {
  categories: Category[];
}

export default function MainNavigation({ categories }: MainNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="main-nav-wrapper">
      {/* Mobile Toggle Button */}
      <div className="mobile-menu-toggle" onClick={toggleMenu} style={{ padding: '0.75rem 1rem', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold' }}>
        <span>MENU PRINCIPAL</span>
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{isOpen ? '✕' : '☰'}</span>
      </div>

      {/* Navigation Links */}
      <nav className={`nav ${isOpen ? 'nav-open' : 'nav-closed'}`}>
        <Link href="/" className="nav-link" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Accueil</Link>
        {categories.map(c => (
          <Link key={c.id} href={`/category/${c.slug}`} className="nav-link" style={{ whiteSpace: 'nowrap' }}>
            {c.name.replace(/&amp;/g, '&')}
          </Link>
        ))}
      </nav>

      <style jsx>{`
        .main-nav-wrapper {
          width: 100%;
        }

        .mobile-menu-toggle {
          display: none;
        }

        .nav {
          display: flex;
          gap: 1.5rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          padding: 0.75rem 1rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: white;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .main-nav-wrapper {
            position: relative;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .nav {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: #111111;
            flex-direction: column;
            gap: 0;
            padding: 0;
            overflow-y: auto;
            max-height: 0;
            transition: max-height 0.3s ease-out;
            align-items: flex-start;
            z-index: 1000;
          }

          .nav.nav-open {
            max-height: calc(100vh - 120px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          }

          .nav-link {
            padding: 1rem;
            width: 100%;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }
          
          .nav-link:first-child {
            border-top: none;
          }
        }
      `}</style>
    </div>
  );
}
