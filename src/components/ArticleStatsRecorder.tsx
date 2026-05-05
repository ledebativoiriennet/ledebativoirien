"use client";

import { useEffect } from "react";
import { recordArticleRead, recordArticleView } from "@/app/actions/user-stats";

export default function ArticleStatsRecorder({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Delayer un peu pour ne pas impacter le premier rendu
    const timer = setTimeout(() => {
      // Record general view (all visitors)
      recordArticleView(articleId).catch(() => {});
      
      // Record personalized reading history (authenticated users only)
      recordArticleRead(articleId).catch(() => {});
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [articleId]);

  return null;
}
