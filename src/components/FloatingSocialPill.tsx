"use client";

import { useState } from "react";

type Props = {
  siteSettings: any;
};

export default function FloatingSocialPill({ siteSettings }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!siteSettings) return null;

  const socials = [
    { url: siteSettings.facebookUrl, color: "#1877F2", label: "f", name: "Facebook" },
    { url: siteSettings.twitterUrl, color: "#000000", label: "𝕏", name: "X" },
    { url: siteSettings.instagramUrl, color: "#dc2743", label: "📷", name: "Instagram", gradient: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" },
    { url: siteSettings.linkedinUrl, color: "#0A66C2", label: "in", name: "LinkedIn" },
    { url: siteSettings.youtubeUrl, color: "#FF0000", label: "▶", name: "YouTube" },
  ].filter(s => s.url);

  if (socials.length === 0) return null;

  return (
    <div 
      className="floating-social-pill"
      style={{
        position: "fixed",
        right: "20px",
        bottom: "100px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "0.8rem"
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div 
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(20px)",
          pointerEvents: isOpen ? "all" : "none",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            title={social.name}
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              backgroundColor: social.color,
              background: social.gradient || social.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              textDecoration: "none",
              fontSize: "1.2rem",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <span style={social.name === "Instagram" ? { fontSize: "1rem" } : {}}>{social.label}</span>
          </a>
        ))}
      </div>

      <div 
        style={{
          width: "55px",
          height: "55px",
          borderRadius: "9999px",
          backgroundColor: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1.2rem",
          fontWeight: "bold",
          boxShadow: "0 6px 15px rgba(236, 26, 36, 0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          padding: isOpen ? "0" : "0 10px",
          width: isOpen ? "55px" : "auto",
          minWidth: "55px"
        }}
      >
        {isOpen ? (
          <span style={{ fontSize: "1.5rem" }}>✕</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <span style={{ fontSize: "1.4rem" }}>👥</span>
             <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>Suivre</span>
          </div>
        )}
      </div>
    </div>
  );
}
