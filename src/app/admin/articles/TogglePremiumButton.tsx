"use client";

import { useState } from "react";
import { toggleArticlePremiumStatus } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function TogglePremiumButton({ articleId, isPremium }: { articleId: string, isPremium: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    if (!confirm(`Voulez-vous vraiment ${isPremium ? "désactiver" : "activer"} le mode Premium pour cet article ?`)) {
      return;
    }

    setLoading(true);
    const result = await toggleArticlePremiumStatus(articleId, isPremium);

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
        backgroundColor: isPremium ? '#ef4444' : '#f59e0b',
        border: 'none',
        color: 'white',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        marginTop: '0.4rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem'
      }}
      title={isPremium ? "Passer en article gratuit" : "Passer en article Premium"}
    >
      {loading ? "..." : (isPremium ? "Rendre Gratuit" : "⭐ Rendre Premium")}
    </button>
  );
}
