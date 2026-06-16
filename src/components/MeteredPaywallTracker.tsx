"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function MeteredPaywallTracker({ articleId }: { articleId: string }) {
  const { data: session } = useSession();

  useEffect(() => {
    // Ne traquer les cookies que pour les utilisateurs non connectés
    if (session) return;

    try {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const setCookie = (name: string, value: string, days: number) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
      };

      const cookieVal = getCookie('metered_read_articles');
      let readArticles: string[] = [];
      
      if (cookieVal) {
        try {
          readArticles = JSON.parse(decodeURIComponent(cookieVal));
        } catch (e) {
          console.error("Error parsing read articles cookie", e);
        }
      }

      if (!readArticles.includes(articleId)) {
        readArticles.push(articleId);
        // Expiration : 30 jours
        setCookie('metered_read_articles', encodeURIComponent(JSON.stringify(readArticles)), 30);
      }
    } catch (err) {
      console.error("MeteredPaywallTracker error:", err);
    }
  }, [articleId, session]);

  return null;
}
