"use client";

import { useState } from "react";
import { subscribeToAuthor } from "@/app/actions/newsletter";

export default function AuthorSubscribeButton({ authorId, authorName }: { authorId?: string, authorName?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  if (!authorId) return null; // Impossible de s'abonner sans ID

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const result = await subscribeToAuthor(email, authorId as string);
    if (result.success) {
      setSuccess(true);
      setIsFormVisible(false);
    } else {
      alert(result.error);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", marginTop: "0.5rem" }}>
        ✅ Abonné(e) à {authorName} !
      </div>
    );
  }

  if (!isFormVisible) {
    return (
      <button 
        onClick={() => setIsFormVisible(true)}
        className="btn" 
        style={{ width: "100%", backgroundColor: "var(--primary)", color: "white", padding: "0.5rem", fontSize: "0.8rem", cursor: "pointer", border: "none", borderRadius: "4px", transition: "all 0.2s" }}
      >
        S'abonner à l'auteur
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input 
        type="email" 
        placeholder="Votre email..." 
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="input"
        style={{ padding: "0.5rem", fontSize: "0.8rem" }}
        required
        autoFocus
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" disabled={loading} style={{ flex: 1, backgroundColor: "var(--primary)", color: "white", border: "none", padding: "0.5rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" }}>
          {loading ? "..." : "Valider"}
        </button>
        <button type="button" onClick={() => setIsFormVisible(false)} style={{ backgroundColor: "#e2e8f0", color: "#475569", border: "none", padding: "0.5rem 0.8rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" }}>
          ✖
        </button>
      </div>
    </form>
  );
}
