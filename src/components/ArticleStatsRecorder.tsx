"use client";

import { useEffect } from "react";
import { recordArticleRead } from "@/app/actions/user-stats";

export default function ArticleStatsRecorder({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Delayer un peu pour ne pas impacter le premier rendu
    const timer = setTimeout(() => {
      recordArticleRead(articleId).catch(() => {
        // Silently fail, not critical for user experience
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [articleId]);

  return null;
}
