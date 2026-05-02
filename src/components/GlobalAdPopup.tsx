"use client";

import { useState, useEffect } from "react";

export default function GlobalAdPopup({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we've already shown it in this session
    const hasSeenPopup = sessionStorage.getItem("ad_popup_seen");
    if (!hasSeenPopup) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    sessionStorage.setItem("ad_popup_seen", "true");
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'relative', backgroundColor: 'transparent', maxWidth: '800px', width: '100%', animation: 'fadeIn 0.3s ease-out' }}>
        <button 
          onClick={closePopup} 
          style={{ position: 'absolute', top: '-40px', right: '0', background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '30px', height: '30px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', zIndex: 100000 }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
