"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveArticle, unpublishArticle, deleteArticle } from "@/app/actions/admin";

import Link from "next/link";

export default function ArticleActionButtons({ 
  articleId, 
  isPublished, 
  isLiveBlog
}: { 
  articleId: string, 
  isPublished: boolean,
  isLiveBlog?: boolean
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function handleApprove() {
    setLoadingAction("approve");
    const result = await approveArticle(articleId);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(result.error);
    }
    setLoadingAction(null);
  }

  async function handleUnpublish() {
    setLoadingAction("unpublish");
    const result = await unpublishArticle(articleId);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(result.error);
    }
    setLoadingAction(null);
  }

  async function handleDelete() {
    if (!confirm("Voulez-vous vraiment supprimer cet article définitivement ? Cette action est irréversible.")) {
      return;
    }
    setLoadingAction("delete");
    const result = await deleteArticle(articleId);
    if (result.success) {
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(result.error);
    }
    setLoadingAction(null);
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
      {!isPublished ? (
        <button 
          onClick={handleApprove} 
          disabled={isPending || loadingAction !== null}
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #16a34a', backgroundColor: '#f0fdf4', color: '#16a34a', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loadingAction === "approve" ? "..." : "Publier"}
        </button>
      ) : (
        <button 
          onClick={handleUnpublish} 
          disabled={isPending || loadingAction !== null}
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #d97706', backgroundColor: '#fffbeb', color: '#d97706', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loadingAction === "unpublish" ? "..." : "Dépublier"}
        </button>
      )}

      <button 
        onClick={handleDelete} 
        disabled={isPending || loadingAction !== null}
        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #dc2626', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {loadingAction === "delete" ? "..." : "Supprimer"}
      </button>
      {isLiveBlog && (
        <Link href={`/admin/articles/${articleId}/live`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #dc2626', backgroundColor: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}>
          🔴 Gérer le Direct
        </Link>
      )}
    </div>
  );
}
