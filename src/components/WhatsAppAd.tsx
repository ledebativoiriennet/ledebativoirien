"use client";

import SafeImage from "./SafeImage";

export default function WhatsAppAd() {
  const channelUrl = "https://whatsapp.com/channel/0029VbCauTA6xCSNYgDwIj1u";
  
  return (
    <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
      <a 
        href={channelUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          display: "block", 
          overflow: "hidden", 
          borderRadius: "12px", 
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          transition: "transform 0.3s ease-in-out"
        }}
        className="whatsapp-ad-link"
      >
        <SafeImage 
          src="/whatsapp-banner.png" 
          alt="Suivre LE DEBAT IVOIRIEN sur WhatsApp" 
          style={{ width: "100%", height: "auto", display: "block" }} 
        />
      </a>
      <style dangerouslySetInnerHTML={{ __html: `
        .whatsapp-ad-link:hover {
          transform: translateY(-5px);
        }
      `}} />
    </div>
  );
}
