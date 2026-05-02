"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div style={{ width: '100px', height: '35px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>;
  }

  if (session && session.user) {
    const role = (session.user as any).role;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {(role === 'ADMIN' || role === 'EDITOR') && (
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#991b1b', textDecoration: 'none', backgroundColor: '#fee2e2', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
            <span style={{ fontSize: '0.8rem' }}>⚙️ Back-Office</span>
          </Link>
        )}
        <Link href="/mon-compte" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--foreground)', textDecoration: 'none' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
            {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '0.9rem' }}>Mon Compte</span>
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: window.location.origin })} 
          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link href="/login" style={{ color: 'var(--foreground)', fontWeight: 'bold', padding: '0.5rem 1rem', textDecoration: 'none', fontSize: '0.9rem' }}>Connexion</Link>
      <Link href="/abonnement" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>S'abonner</Link>
    </div>
  );
}
