'use client';
import { useEffect } from 'react';

type GoogleAdSlotProps = {
  adClient?: string;
  adSlot: string;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
};

export default function GoogleAdSlot({ 
  adClient = "ca-pub-4879894549191568", 
  adSlot, 
  width = "336px",
  height = "280px",
  style 
}: GoogleAdSlotProps) {
  
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [adSlot]);

  return (
    <div className="google-ad-container" style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
        <span style={{ position: 'absolute', top: '-15px', right: '0', fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Publicité</span>
        <ins className="adsbygoogle"
          style={{ display: 'inline-block', width, height, ...style }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
        ></ins>
      </div>
    </div>
  );
}
