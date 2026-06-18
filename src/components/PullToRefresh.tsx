"use client";

import { useEffect, useState } from 'react';

export default function PullToRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0 && window.scrollY === 0) {
        // Prevent default only if we are pulling down at the very top
        e.preventDefault();
        setPullDistance(Math.min(distance * 0.4, 80)); // Dampen the pull
      } else {
        isPulling = false;
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (!isPulling) return;
      isPulling = false;
      
      if (pullDistance >= 60) {
        setRefreshing(true);
        // Simulate a network request or trigger a hard reload
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullDistance]);

  if (pullDistance === 0 && !refreshing) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: pullDistance > 0 || refreshing ? 1 : 0,
        transform: `translateY(${Math.min(pullDistance - 40, 20)}px)`,
        transition: refreshing ? 'transform 0.3s, opacity 0.3s' : 'none',
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          transform: `rotate(${pullDistance * 2}deg)`,
        }}>
          {refreshing ? (
            <div className="spinner" style={{ width: '20px', height: '20px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : (
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>↓</span>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        /* Empêche le rebond d'overscroll par défaut (overscroll-behavior) sur le body */
        body {
          overscroll-behavior-y: none;
        }
      `}</style>
    </>
  );
}
