"use client";

import { useState } from "react";
import { revokeAccess } from "@/app/actions/team";
import { useRouter } from "next/navigation";

export default function RevokeButton({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRevoke() {
    if (!confirm(`Êtes-vous sûr de vouloir retirer les accès administrateur à ${userName} ? Il redeviendra un simple lecteur.`)) {
      return;
    }

    setLoading(true);
    const result = await revokeAccess(userId);
    
    if (result.success) {
      alert("Accès révoqué avec succès.");
      router.refresh();
    } else {
      alert(result.error || "Une erreur est survenue.");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      style={{
        padding: '0.4rem 0.8rem',
        backgroundColor: 'white',
        border: '1px solid #ef4444',
        color: '#ef4444',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1
      }}
    >
      {loading ? "..." : "Révoquer accès"}
    </button>
  );
}
