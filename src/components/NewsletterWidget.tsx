"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import Honeypot from "./Honeypot";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const result = await subscribeNewsletter(formData);
    
    if (result.success) {
      setSuccess(true);
      setEmail("");
    } else {
      setError(result.error || "Erreur");
    }
    setLoading(false);
  }

  return (
    <div id="newsletter" style={{
      background: 'linear-gradient(rgba(17, 17, 17, 0.8), rgba(17, 17, 17, 0.95)), url("/promo-newsletter.png") center/cover no-repeat',
      color: "white",
      padding: "2.5rem 2rem",
      borderRadius: "var(--radius)",
      marginTop: "2rem",
      textAlign: "center",
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <h3 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: "0.5rem", color: "#ffffff", letterSpacing: "-0.02em" }}>Restez informé</h3>
      <p style={{ fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "1.5rem", lineHeight: 1.5 }}>
        Recevez l'essentiel de l'actualité ivoirienne chaque soir directement dans votre boîte mail.
      </p>
      
      {success ? (
        <div style={{ 
          backgroundColor: 'rgba(22, 101, 52, 0.2)', 
          border: '1px solid #166534',
          color: '#4ade80', 
          padding: '1rem', 
          borderRadius: '8px', 
          fontWeight: 'bold',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          ✅ Merci pour votre inscription !
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px', margin: '0 auto' }}>
          <Honeypot />
          <input 
            type="email" 
            name="email"
            placeholder="Votre adresse email..." 
            style={{ 
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none',
            }} 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 'bold' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ 
            width: "100%", 
            backgroundColor: "#e60000", 
            color: "white", 
            border: 'none', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? "Inscription..." : "S'abonner gratuitement"}
          </button>
        </form>
      )}
    </div>
  );
}
