"use client";

import { useState, useEffect } from 'react';

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) return;

    // Check if we already asked
    const hasPrompted = localStorage.getItem('ldi_push_prompted');
    const permission = Notification.permission;

    if (!hasPrompted && permission === 'default') {
      // Delay prompt so it doesn't immediately block the user on page load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert('Merci ! Vous recevrez désormais une notification lors de nos publications importantes.');
      }
    } catch (e) {
      console.error('Error requesting notification permission:', e);
    } finally {
      localStorage.setItem('ldi_push_prompted', 'true');
      setShowPrompt(false);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('ldi_push_prompted', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      zIndex: 9999,
      maxWidth: '350px',
      border: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2rem' }}>🔔</div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Ne manquez aucune info !</h4>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--muted)' }}>
            Acceptez les notifications pour être alerté en temps réel lors de la publication d'un nouvel article majeur.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleDecline}
          style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Plus tard
        </button>
        <button 
          onClick={handleAccept}
          style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
          Activer
        </button>
      </div>
    </div>
  );
}

export function ConsentManagerButton() {
  return (
    <button 
      style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0, fontSize: 'inherit', textAlign: 'left' }} 
      onClick={() => { 
        localStorage.removeItem('ldi_push_prompted'); 
        localStorage.removeItem('ldi_cookie_consent');
        window.location.reload(); 
      }}
    >
      Gérer mes consentements
    </button>
  );
}
