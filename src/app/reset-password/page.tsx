"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Jeton de réinitialisation manquant.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await resetPassword(token, password);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #f87171', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          ⚠️ Lien de réinitialisation invalide ou manquant.
        </div>
        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Retour à la connexion</Link>
      </div>
    );
  }

  return (
    <>
      {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '4px', border: '1px solid #f87171', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
      
      {success ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            🎉 Votre mot de passe a été réinitialisé avec succès ! Redirection vers la page de connexion...
          </div>
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Se connecter maintenant</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Nouveau mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="input" 
              minLength={6}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Confirmer le mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="input" 
              minLength={6}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: 'bold', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? "Mise à jour..." : "Modifier le mot de passe"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)', textAlign: 'center' }}>Réinitialisation</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>Saisissez votre nouveau mot de passe</p>
        
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
