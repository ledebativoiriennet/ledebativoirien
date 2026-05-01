"use client";

import { useState } from "react";
import { toggleArticleLike } from "@/app/actions/user-stats";
import { useSession } from "next-auth/react";

export function LikeButton({ articleId, initialLiked, initialCount }: { articleId: string, initialLiked: boolean, initialCount: number }) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      alert("Vous devez être connecté pour aimer un article.");
      return;
    }

    setLoading(true);
    // Optimistic UI update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    const res = await toggleArticleLike(articleId);
    if (!res.success) {
      // Revert if failed
      setLiked(liked);
      setCount(count);
      if (res.error) alert(res.error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleLike} 
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: liked ? '#fecaca' : 'var(--border)',
        backgroundColor: liked ? '#fef2f2' : 'var(--card-bg)',
        color: liked ? '#dc2626' : 'var(--foreground)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: 'bold'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{liked ? '❤️' : '🤍'}</span>
      <span>{count} J'aime</span>
    </button>
  );
}
