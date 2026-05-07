"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    const result = await subscribeNewsletter(email);
    if (result.success) {
      setSuccess(true);
      setEmail("");
    } else {
      setError(result.error || "Erreur");
    }
    setLoading(false);
  }

  return (
    <div id="newsletter" style={{ backgroundColor: "var(--primary)", color: "white", padding: "1.5rem", borderRadius: "var(--radius)", marginTop: "1.5rem", textAlign: "center" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Restez informé</h3>
      <p style={{ fontSize: "0.8rem", marginBottom: "1rem" }}>Recevez l'essentiel de l'actualité ivoirienne chaque matin.</p>
      
      {success ? (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '4px', fontWeight: 'bold' }}>
          ✅ Merci pour votre inscription !
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Votre email" 
            className="input" 
            style={{ marginBottom: "0.5rem" }} 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div style={{ color: '#fef08a', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn" style={{ width: "100%", backgroundColor: "#111111", color: "white", border: 'none', padding: '0.75rem', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? "..." : "S'inscrire"}
          </button>
        </form>
      )}
    </div>
  );
}
