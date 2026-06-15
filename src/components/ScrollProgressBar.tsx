"use client";

import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (windowHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      
      const scroll = (totalScroll / windowHeight) * 100;
      setScrollProgress(scroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        backgroundColor: "transparent",
        zIndex: 999999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${scrollProgress}%`,
          backgroundColor: "var(--primary)",
          boxShadow: "0 0 10px var(--primary)",
          transition: "width 0.1s ease-out",
        }}
      />
    </div>
  );
}
