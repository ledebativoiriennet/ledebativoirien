"use client";

import { useEffect, useState } from "react";

export default function SocialShareButtons({ title, layout = "horizontal" }: { title: string, layout?: "horizontal" | "vertical" }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      name: "Facebook",
      color: "#1877F2",
      icon: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: "X (Twitter)",
      color: "#000000",
      icon: "𝕏",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: "WhatsApp",
      color: "#25D366",
      icon: "💬",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: "LinkedIn",
      color: "#0A66C2",
      icon: "in",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: "Telegram",
      color: "#229ED9",
      icon: "✈",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: "Email",
      color: "#64748b",
      icon: "✉",
      href: `mailto:?subject=${encodedTitle}&body=Découvrez cet article sur Le Débat Ivoirien : ${encodedUrl}`
    }
  ];

  if (layout === "vertical") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {networks.map(net => (
          <a
            key={net.name}
            href={net.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              padding: "0.75rem", 
              backgroundColor: net.color, 
              color: "white", 
              borderRadius: "4px", 
              fontWeight: "bold",
              textDecoration: "none",
              transition: "opacity 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.8"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            {net.name}
          </a>
        ))}
      </div>
    );
  }

  // Horizontal layout for article body
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1rem 0" }}>
      <span style={{ fontWeight: "bold", marginRight: "0.5rem", display: "flex", alignItems: "center" }}>Partager :</span>
      {networks.map(net => (
        <a
          key={net.name}
          href={net.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Partager sur ${net.name}`}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            width: "35px", 
            height: "35px", 
            backgroundColor: net.color, 
            color: "white", 
            borderRadius: "50%", 
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: "1rem"
          }}
          onMouseOver={e => e.currentTarget.style.opacity = "0.8"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          {net.icon}
        </a>
      ))}
    </div>
  );
}
