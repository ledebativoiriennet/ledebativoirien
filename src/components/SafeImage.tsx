"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function SafeImage({ src, fallbackSrc = "/logo.png", alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src as string | undefined);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src as string | undefined);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
    }
  };

  if (hasError || !imgSrc) {
    return (
      <div 
        style={{ 
          width: props.style?.width || "100%", 
          height: props.style?.height || "100%", 
          minHeight: "150px",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          borderRadius: props.style?.borderRadius || "inherit"
        }}
        {...(props as any)}
      >
        <div style={{ opacity: 0.1, width: "60%", transform: "rotate(-15deg)" }}>
           <img src="/logo.png" alt="" style={{ width: "100%", height: "auto" }} />
        </div>
        <div style={{ position: "absolute", color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
           Le Débat Ivoirien
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || ""}
      onError={handleError}
      {...props}
    />
  );
}
