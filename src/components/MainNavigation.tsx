"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LiveStreamBadge from '@/components/LiveStreamBadge';

interface Article {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string | null;
  publishedAt?: Date | null;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  articles?: Article[];
}

interface MainNavigationProps {
  categories: Category[];
}

export default function MainNavigation({ categories }: MainNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
    setActiveCategory(null);
  }, [pathname]);

  const activeCategoryData = categories.find(c => c.id === activeCategory);

  return (
    <div className="main-nav-wrapper" onMouseLeave={() => setActiveCategory(null)}>
      {/* Mobile Toggle Button */}
      <div className="mobile-menu-toggle" onClick={toggleMenu} style={{ padding: '0.75rem 1rem', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 'bold' }}>
        <span>MENU PRINCIPAL</span>
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{isOpen ? '✕' : '☰'}</span>
      </div>

      {/* Navigation Links */}
      <nav className={`nav ${isOpen ? 'nav-open' : 'nav-closed'}`}>
        <Link href="/" className="nav-link" style={{ fontWeight: 'bold', color: 'var(--primary)' }} onMouseEnter={() => setActiveCategory(null)}>
          Accueil
        </Link>
        <Link href="/confidentiels" className="nav-link" style={{ fontWeight: 'bold', borderBottom: '2px solid #7f1d1d' }} onMouseEnter={() => setActiveCategory(null)}>
          🔒 Confidentiels
        </Link>

        <div onMouseEnter={() => setActiveCategory(null)} style={{ display: 'flex', alignItems: 'center' }}>
          <LiveStreamBadge />
        </div>
        {categories.map(c => (
          <div key={c.id} className="nav-item" onMouseEnter={() => setActiveCategory(c.id)}>
            <Link href={`/category/${c.slug}`} className="nav-link" style={{ whiteSpace: 'nowrap' }}>
              {c.name.replace(/&amp;/g, '&')}
            </Link>
          </div>
        ))}
      </nav>

      {/* Mega Menu Dropdown (Desktop Only) */}
      {activeCategoryData && activeCategoryData.articles && activeCategoryData.articles.length > 0 && (
        <div className="mega-menu">
          <div className="mega-menu-content">
            <div className="mega-menu-header">
              <h3>À la Une - {activeCategoryData.name.replace(/&amp;/g, '&')}</h3>
              <Link href={`/category/${activeCategoryData.slug}`} className="view-all-link">
                Voir toute la rubrique →
              </Link>
            </div>
            <div className="mega-menu-articles">
              {activeCategoryData.articles.map(article => (
                <Link key={article.id} href={`/article/${article.slug}`} className="mega-menu-article">
                  <div className="mega-menu-img-container">
                    {article.imageUrl ? (
                      <img src={article.imageUrl} alt={article.title} className="mega-menu-img" />
                    ) : (
                      <div className="mega-menu-img-placeholder">LDI</div>
                    )}
                  </div>
                  <h4 className="mega-menu-title">{article.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .main-nav-wrapper {
          width: 100%;
          position: relative;
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
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }

        .nav::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          text-decoration: none;
          color: white;
          transition: color 0.2s;
          padding: 0.5rem 0;
        }

        .nav-link:hover, .nav-item:hover .nav-link {
          color: var(--primary);
        }

        /* Mega Menu Styles */
        .mega-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          background-color: var(--card-bg);
          border-top: 3px solid var(--primary);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          z-index: 100;
          animation: slideDown 0.2s ease-out forwards;
        }

        .mega-menu-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
        }

        .mega-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
        }

        .mega-menu-header h3 {
          font-size: 1.2rem;
          font-weight: 900;
          color: var(--foreground);
          margin: 0;
        }

        .view-all-link {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: bold;
          text-decoration: none;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .mega-menu-articles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .mega-menu-article {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-decoration: none;
        }

        .mega-menu-article:hover .mega-menu-title {
          color: var(--primary);
        }

        .mega-menu-img-container {
          aspect-ratio: 16/9;
          border-radius: 4px;
          overflow: hidden;
          background-color: var(--muted);
        }

        .mega-menu-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .mega-menu-article:hover .mega-menu-img {
          transform: scale(1.05);
        }

        .mega-menu-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--foreground);
          color: white;
          font-weight: bold;
          font-size: 1.5rem;
        }

        .mega-menu-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.3;
          margin: 0;
          transition: color 0.2s;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Styles */
        @media (max-width: 1024px) {
          .mega-menu {
            display: none !important; /* Pas de mega menu sur mobile/tablette pour l'instant */
          }
        }

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
