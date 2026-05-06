"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl') || "/";
      window.location.href = callbackUrl;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)', textAlign: 'center' }}>Connexion</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>Accédez à votre espace Le Débat Ivoirien</p>
        
        {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '4px', border: '1px solid #f87171', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Mot de passe</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="input" 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontWeight: 'bold', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'center' }}>
          Pas encore de compte ? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>S'inscrire</Link>
        </div>
      </div>
    </div>
  );
}
