"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MobileMenuHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Fermer le menu mobile lors du changement de route
    const checkbox = document.getElementById("admin-menu-toggle") as HTMLInputElement;
    if (checkbox && checkbox.checked) {
      checkbox.checked = false;
    }
  }, [pathname]);

  return null;
}
