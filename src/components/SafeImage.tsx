"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * A robust image component that falls back to a default placeholder if the source fails to load.
 */
export default function SafeImage({ src, fallbackSrc = "/default-article.png", alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src as string | undefined);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src as string | undefined);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt || ""}
      onError={handleError}
      {...props}
    />
  );
}
