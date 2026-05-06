"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate how far down the user has scrolled
      const totalScroll = document.documentElement.scrollTop;
      // Calculate the total scrollable height
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Calculate percentage
      const scrollPercentage = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      
      setProgress(scrollPercentage);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial call to set progress if already scrolled
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress === 0) return null;

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "4px", 
        backgroundColor: "transparent", 
        zIndex: 9999,
        pointerEvents: "none"
      }}
    >
      <div 
        style={{ 
          width: `${progress}%`, 
          height: "100%", 
          backgroundColor: "var(--primary)", 
          transition: "width 0.1s ease-out",
          boxShadow: "0 0 10px var(--primary)"
        }} 
      />
    </div>
  );
}
