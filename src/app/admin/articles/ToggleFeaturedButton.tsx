"use client";

import { useState } from "react";
import { toggleArticleFeaturedStatus } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function ToggleFeaturedButton({ articleId, isFeatured }: { articleId: string, isFeatured: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    if (!confirm(`Voulez-vous vraiment ${isFeatured ? "retirer de la Une" : "mettre en Une"} cet article ?`)) {
      return;
    }

    setLoading(true);
    const result = await toggleArticleFeaturedStatus(articleId, isFeatured);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Erreur lors de la modification du statut.");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        padding: '0.2rem 0.5rem',
        backgroundColor: isFeatured ? '#1e40af' : '#cbd5e1',
        border: 'none',
        color: isFeatured ? 'white' : '#475569',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        marginTop: '0.4rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        marginLeft: '0.5rem'
      }}
      title={isFeatured ? "Retirer de la Une" : "Mettre en Une"}
    >
      {loading ? "..." : (isFeatured ? "🌟 À la Une" : "☆ Mettre en Une")}
    </button>
  );
}
