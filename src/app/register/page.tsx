"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await registerUser(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Auto-login after successful registration
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/");
        router.refresh();
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '6rem auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--foreground)' }}>Inscription</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Créez votre compte gratuit Le Débat Ivoirien</p>
      
      {error && <div style={{ color: '#b91c1c', marginBottom: '1.5rem', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '4px', border: '1px solid #f87171' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Nom complet</label>
          <input type="text" name="name" placeholder="Jean Dupont" className="input" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Email</label>
          <input type="email" name="email" placeholder="votre@email.com" className="input" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Mot de passe</label>
          <input type="password" name="password" placeholder="••••••••" minLength={6} className="input" required />
        </div>

        {/* --- ESPACE GOOGLE RECAPTCHA ---
            Lorsque vous aurez vos clés, décommentez et insérez votre composant ici :
            <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} onChange={handleCaptchaChange} />
        */}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'left' }}>
          <input type="checkbox" id="consent_register" name="consent" required style={{ marginTop: '0.25rem', cursor: 'pointer' }} />
          <label htmlFor="consent_register" style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4 }}>
            J'accepte les <Link href="/cgu" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Conditions Générales</Link> et la <Link href="/confidentialite" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Politique de Confidentialité</Link>.
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
          {loading ? "Création en cours..." : "Créer mon compte"}
        </button>
      </form>
      
      <div style={{ marginTop: '2rem', fontSize: '0.95rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        Déjà un compte ? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Connectez-vous</Link>
      </div>
    </div>
  );
}
