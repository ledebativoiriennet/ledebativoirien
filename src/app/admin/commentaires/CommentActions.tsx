"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentActions({ commentId, isActive }: { commentId: string, isActive: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleStatus = async (newStatus: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour du statut.");
      }
    } catch (error) {
      alert("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer définitivement ce commentaire ?")) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      alert("Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {!isActive ? (
        <button 
          onClick={() => handleToggleStatus(true)}
          disabled={isLoading}
          style={{ padding: "0.4rem 0.8rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: isLoading ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
        >
          ✅ Valider
        </button>
      ) : (
        <button 
          onClick={() => handleToggleStatus(false)}
          disabled={isLoading}
          style={{ padding: "0.4rem 0.8rem", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "4px", cursor: isLoading ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
        >
          ⏸️ Suspendre
        </button>
      )}
      
      <button 
        onClick={handleDelete}
        disabled={isLoading}
        style={{ padding: "0.4rem 0.8rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: isLoading ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
      >
        🗑️ Supprimer
      </button>
    </div>
  );
}
