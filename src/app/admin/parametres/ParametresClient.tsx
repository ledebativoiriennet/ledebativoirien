"use client";

import { useState } from "react";
import { updateProfile, updatePassword } from "@/app/actions/profile";
import { updateSiteSettings } from "@/app/actions/content";

export default function ParametresClient({ user, siteSettings }: { user: { id: string, name: string | null, email: string | null }, siteSettings?: any }) {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingSkin, setLoadingSkin] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingProfile(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    const res = await updateProfile(name, email);
    if (res?.error) {
      alert(res.error);
    } else {
      alert("Profil mis à jour avec succès !");
    }
    setLoadingProfile(false);
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingSecurity(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      setLoadingSecurity(false);
      return;
    }

    const res = await updatePassword(password);
    if (res?.error) {
      alert(res.error);
    } else {
      alert("Mot de passe modifié avec succès ! Veuillez vous reconnecter lors de votre prochaine session.");
      (e.target as HTMLFormElement).reset();
    }
    setLoadingSecurity(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Profil */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          Informations du Profil
        </h2>
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Nom complet</label>
            <input type="text" name="name" defaultValue={user.name || ""} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Adresse e-mail</label>
            <input type="email" name="email" defaultValue={user.email || ""} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <button type="submit" disabled={loadingProfile} style={{ alignSelf: 'flex-start', padding: '0.75rem 1.5rem', backgroundColor: '#0f172a', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loadingProfile ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}>
            {loadingProfile ? 'Enregistrement...' : 'Mettre à jour le profil'}
          </button>
        </form>
      </div>

      {/* Sécurité */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          Sécurité (Mot de passe)
        </h2>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Nouveau mot de passe</label>
            <input type="password" name="password" required minLength={6} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Confirmer le nouveau mot de passe</label>
            <input type="password" name="confirmPassword" required minLength={6} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <button type="submit" disabled={loadingSecurity} style={{ alignSelf: 'flex-start', padding: '0.75rem 1.5rem', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loadingSecurity ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}>
            {loadingSecurity ? 'Enregistrement...' : 'Changer mon mot de passe'}
          </button>
    </div>
  );
}
