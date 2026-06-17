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
        </form>
      </div>

      {/* Apparence du Site / Habillage */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          Apparence & Habillage du Site
        </h2>
        <form onSubmit={async (e) => {
          e.preventDefault();
          setLoadingSkin(true);
          const formData = new FormData(e.currentTarget);
          const res = await updateSiteSettings({
            siteSkinBlur: parseInt(formData.get("siteSkinBlur") as string || "0"),
            siteSkinBrightness: parseInt(formData.get("siteSkinBrightness") as string || "100"),
            siteSkinAttachment: formData.get("siteSkinAttachment") as string
          });
          if (res?.success) alert("Paramètres d'habillage mis à jour !");
          else alert("Erreur lors de la mise à jour");
          setLoadingSkin(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>
              Flou de l'arrière-plan (en pixels)
            </label>
            <input type="range" name="siteSkinBlur" min="0" max="50" defaultValue={siteSettings?.siteSkinBlur ?? 0} style={{ width: '100%', marginBottom: '0.5rem' }} onInput={(e) => document.getElementById('blurVal')!.innerText = e.currentTarget.value + 'px'} />
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Valeur actuelle : <span id="blurVal" style={{ fontWeight: 'bold' }}>{siteSettings?.siteSkinBlur ?? 0}px</span> (0 = net, 20 = très flou)</div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>
              Clarté / Luminosité (%)
            </label>
            <input type="range" name="siteSkinBrightness" min="0" max="200" defaultValue={siteSettings?.siteSkinBrightness ?? 100} style={{ width: '100%', marginBottom: '0.5rem' }} onInput={(e) => document.getElementById('brightVal')!.innerText = e.currentTarget.value + '%'} />
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Valeur actuelle : <span id="brightVal" style={{ fontWeight: 'bold' }}>{siteSettings?.siteSkinBrightness ?? 100}%</span> (100 = normal, 50 = sombre)</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>
              Mouvement / Fixation
            </label>
            <select name="siteSkinAttachment" defaultValue={siteSettings?.siteSkinAttachment ?? 'fixed'} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white' }}>
              <option value="fixed">Fixe (L'image reste en place pendant le défilement)</option>
              <option value="scroll">Défilant (L'image défile avec le contenu)</option>
            </select>
          </div>

          <button type="submit" disabled={loadingSkin} style={{ alignSelf: 'flex-start', padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loadingSkin ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}>
            {loadingSkin ? 'Enregistrement...' : 'Mettre à jour l\'habillage'}
          </button>
        </form>
      </div>

    </div>
  );
}
