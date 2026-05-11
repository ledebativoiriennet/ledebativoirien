'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

type GoogleAdSlotProps = {
  adClient?: string;
  adSlot: string;
  width?: string;
  height?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
};

export default function GoogleAdSlot({ 
  adClient = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-4879894549191568", 
  adSlot, 
  width,
  height,
  style,
  responsive = true
}: GoogleAdSlotProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [pathname, adSlot]);

  return (
    <div 
      className="google-ad-container" 
      key={`ad-${adSlot}-${pathname}`}
      style={{ 
        margin: '1.5rem 0', 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%', 
        overflow: 'hidden',
        minHeight: height || '90px'
      }}
    >
      <div style={{ position: 'relative', display: 'block', width: width || '100%', maxWidth: '100%' }}>
        <span style={{ position: 'absolute', top: '-15px', right: '0', fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase' }}>Publicité</span>
        <ins className="adsbygoogle"
          style={{ 
            display: 'block', 
            width: width || '100%', 
            height: height || 'auto', 
            ...style 
          }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={responsive ? "auto" : undefined}
          data-full-width-responsive={responsive ? "true" : undefined}
        ></ins>
      </div>
    </div>
  );
}
