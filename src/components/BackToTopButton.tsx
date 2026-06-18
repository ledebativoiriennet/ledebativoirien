"use client";

import { useState, useEffect } from 'react';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="back-to-top"
          aria-label="Retour en haut"
        >
          ↑
        </button>
      )}
      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: var(--primary);
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          opacity: 0.8;
        }
        .back-to-top:hover {
          opacity: 1;
          transform: translateY(-3px);
        }
        @media (max-width: 768px) {
          .back-to-top {
            /* Positionné au-dessus de la BottomNavBar */
            bottom: calc(80px + env(safe-area-inset-bottom));
            right: 20px;
            width: 44px;
            height: 44px;
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  );
}
