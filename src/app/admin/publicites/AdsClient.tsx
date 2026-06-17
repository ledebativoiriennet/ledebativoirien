"use client";

import { useState } from "react";
import Link from "next/link";
import { createAd, updateAdStatus, deleteAd } from "@/app/actions/ads";
import { updateSiteSettings } from "@/app/actions/content";

export default function AdsClient({ initialAds, siteSettings }: { initialAds: any[], siteSettings?: any }) {
  const [loading, setLoading] = useState(false);
  const [loadingSkin, setLoadingSkin] = useState(false);

  const slots = [
    { id: 'HOME_TOP', label: 'Accueil - Haut' },
    { id: 'HOME_MIDDLE', label: 'Accueil - Milieu' },
    { id: 'HOME_SIDEBAR', label: 'Accueil - Barre Latérale' },
    { id: 'ARTICLE_TOP', label: 'Article - Haut' },
    { id: 'ARTICLE_MIDDLE', label: 'Article - Milieu' },
    { id: 'ARTICLE_BOTTOM', label: 'Article - Bas' },
    { id: 'GLOBAL_POPUP', label: 'Global - Pop-up' },
    { id: 'SITE_SKIN', label: 'Habillage de Site (Arrière-plan)' }
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await createAd(formData);
      
      if (res?.error) {
        alert("Erreur: " + res.error);
      } else {
        alert("Publicité ajoutée avec succès !");
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      console.error(err);
      alert("Erreur réseau ou fichier trop lourd (1MB max par défaut).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
      {/* Formulaire d'ajout */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'start' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Nouvelle Publicité</h2>
          <Link href="/admin/publicites/stats" style={{ fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold', padding: '0.4rem 0.8rem', border: '1px solid #3b82f6', borderRadius: '4px' }}>
            📊 Voir Statistiques & Traçabilité
          </Link>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Titre de la campagne *</label>
            <input type="text" name="title" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Annonceur (Entreprise) *</label>
            <input type="text" name="company" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Image / Visuel *</label>
            <input type="file" name="image" accept="image/*" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Lien de redirection (Optionnel)</label>
            <input type="url" name="linkUrl" placeholder="https://" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Emplacement (Slot) *</label>
            <select name="slot" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white' }}>
              {slots.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Date de début</label>
              <input type="date" name="startDate" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Date de fin</label>
              <input type="date" name="endDate" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Enregistrement...' : 'Ajouter la publicité'}
          </button>
        </form>
      </div>

      {/* Configuration Habillage (si sélectionné) */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'start', gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Options de l'Habillage de Site (Arrière-plan)</h2>
        </div>
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
        }} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>
              Flou de l'arrière-plan (px)
            </label>
            <input type="range" name="siteSkinBlur" min="0" max="50" defaultValue={siteSettings?.siteSkinBlur ?? 0} style={{ width: '100%', marginBottom: '0.5rem' }} onInput={(e) => document.getElementById('adsBlurVal')!.innerText = e.currentTarget.value + 'px'} />
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}><span id="adsBlurVal" style={{ fontWeight: 'bold' }}>{siteSettings?.siteSkinBlur ?? 0}px</span></div>
          </div>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>
              Clarté / Luminosité (%)
            </label>
            <input type="range" name="siteSkinBrightness" min="0" max="200" defaultValue={siteSettings?.siteSkinBrightness ?? 100} style={{ width: '100%', marginBottom: '0.5rem' }} onInput={(e) => document.getElementById('adsBrightVal')!.innerText = e.currentTarget.value + '%'} />
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}><span id="adsBrightVal" style={{ fontWeight: 'bold' }}>{siteSettings?.siteSkinBrightness ?? 100}%</span></div>
          </div>

          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>
              Mouvement
            </label>
            <select name="siteSkinAttachment" defaultValue={siteSettings?.siteSkinAttachment ?? 'fixed'} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white' }}>
              <option value="fixed">Fixe (Reste en place)</option>
              <option value="scroll">Défilant (Scrolle avec le contenu)</option>
            </select>
          </div>

          <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={loadingSkin} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loadingSkin ? 'not-allowed' : 'pointer' }}>
              {loadingSkin ? 'Enregistrement...' : 'Mettre à jour l\'habillage'}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des publicités */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: '1 / -1' }}>
        {initialAds.map(ad => (
          <div key={ad.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <img src={ad.imageUrl} alt={ad.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.2rem' }}>{ad.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{ad.company} • Emplacement : <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{slots.find(s => s.id === ad.slot)?.label || ad.slot}</span></p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Clics : {ad.clicks} • Vues : {ad.impressions}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold',
                    backgroundColor: ad.status === 'ACTIVE' ? '#dcfce7' : ad.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                    color: ad.status === 'ACTIVE' ? '#166534' : ad.status === 'REJECTED' ? '#991b1b' : '#92400e'
                  }}>
                    {ad.status === 'ACTIVE' ? 'Actif' : ad.status === 'REJECTED' ? 'Désactivé' : 'En Attente'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {ad.status !== 'ACTIVE' && (
                      <button onClick={() => updateAdStatus(ad.id, 'ACTIVE')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Activer</button>
                    )}
                    {ad.status !== 'REJECTED' && (
                      <button onClick={() => updateAdStatus(ad.id, 'REJECTED')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Désactiver</button>
                    )}
                    <button onClick={() => { if(confirm('Voulez-vous vraiment supprimer cette publicité ?')) deleteAd(ad.id); }} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Suppr.</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {initialAds.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', textAlign: 'center', borderRadius: '8px', color: '#64748b' }}>
            Aucune publicité n&apos;a été ajoutée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
