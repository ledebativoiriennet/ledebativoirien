"use client";
import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await requestPasswordReset(email);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)', textAlign: 'center' }}>Mot de passe oublié</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>Saisissez votre e-mail pour recevoir un lien de réinitialisation</p>
        
        {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '4px', border: '1px solid #f87171', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              📩 Si un compte correspond à cet e-mail, vous recevrez un lien de réinitialisation dans quelques instants.
            </div>
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
              <input 
                type="email" 
                placeholder="votre@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input" 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        )}
        
        {!success && (
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <Link href="/login" style={{ color: 'var(--muted)', fontWeight: 'bold' }}>Retour à la connexion</Link>
          </div>
        )}
      </div>
    </div>
  );
}
