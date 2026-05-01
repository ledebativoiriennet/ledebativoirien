"use client";

import { useState } from "react";
import { approveArticle } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function ApproveButton({ articleId }: { articleId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    if (!confirm("Voulez-vous vraiment valider et publier cet article ?")) {
      return;
    }

    setLoading(true);
    const result = await approveArticle(articleId);

    if (result.success) {
      alert("Article publié avec succès !");
      router.refresh();
    } else {
      alert(result.error || "Erreur lors de l'approbation.");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      style={{
        padding: '0.4rem 0.8rem',
        backgroundColor: '#10b981',
        border: 'none',
        color: 'white',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        marginTop: '0.5rem',
        display: 'block'
      }}
    >
      {loading ? "..." : "✅ Approuver"}
    </button>
  );
}
