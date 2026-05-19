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
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
};

export default function GoogleAdSlot({ 
  adClient = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-4879894549191568", 
  adSlot, 
  width,
  height,
  style,
  responsive = true,
  format = 'auto',
  className
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
      className={`google-ad-container ${className || ''}`}
      key={`ad-${adSlot}-${pathname}`}
      style={{ 
        margin: '1.5rem 0', 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%', 
        overflow: 'hidden',
        minHeight: height || (format === 'horizontal' ? '90px' : 'auto')
      }}
    >
      <div style={{ 
        position: 'relative', 
        display: 'block', 
        width: width || '100%', 
        maxWidth: format === 'horizontal' ? '970px' : '100%',
        margin: '0 auto'
      }}>
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
          data-ad-format={responsive ? format : undefined}
          data-full-width-responsive={responsive ? "true" : undefined}
        ></ins>
      </div>
    </div>
  );
}
