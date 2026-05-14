'use client';

import { useState, useEffect } from 'react';

export default function MatchCountdown({ targetDate, status }: { targetDate: string | Date, status?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (status === 'LIVE') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, status]);

  if (status === 'LIVE') return null;
  if (!timeLeft) return null;

  return (
    <div style={{ 
      marginTop: '0.75rem', 
      fontSize: '0.65rem', 
      fontWeight: 'bold', 
      textTransform: 'uppercase', 
      textAlign: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: '0.3rem',
      borderRadius: '4px',
      color: '#fef08a'
    }}>
      Début dans : {timeLeft.d > 0 && `${timeLeft.d}j `}{timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
    </div>
  );
}
