"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/api")) return;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }).catch(() => {}); // Erreur ignorée silencieusement
  }, [pathname]);

  return null;
}
