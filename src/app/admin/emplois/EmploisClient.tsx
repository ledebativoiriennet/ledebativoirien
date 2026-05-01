"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJobOffer, toggleJobOffer, deleteJobOffer } from "@/app/actions/content";

export default function EmploisClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;
    const url = formData.get("url") as string;

    const res = await createJobOffer(title, company, location, description, url);
    if (res.success) {
      alert("Offre d'emploi publiée !");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  async function handleToggle(id: string, currentState: boolean) {
    const res = await toggleJobOffer(id, !currentState);
    if (res.success) router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer cette offre ?")) return;
    const res = await deleteJobOffer(id);
    if (res.success) router.refresh();
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ajouter une offre d'emploi</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 250px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Intitulé du poste</label>
              <input name="title" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Développeur Web H/F" />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Entreprise</label>
              <input name="company" type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Sillon Technologies" />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Localisation</label>
              <input name="location" type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Abidjan, Plateau" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Description courte</label>
            <textarea name="description" rows={3} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Nous recherchons un profil dynamique pour..." />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Lien vers l'offre complète</label>
            <input name="url" type="url" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: https://linkedin.com/..." />
          </div>
          
          <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "..." : "Publier l'offre"}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem' }}>Poste</th>
              <th style={{ padding: '1rem' }}>Entreprise & Lieu</th>
              <th style={{ padding: '1rem' }}>Statut</th>
              <th style={{ padding: '1rem', width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.title}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <div>🏢 {item.company || 'Non renseigné'}</div>
                  <div>📍 {item.location || 'Non renseigné'}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {item.isActive ? (
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>OUVERTE</span>
                  ) : (
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>FERMÉE</span>
                  )}
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleToggle(item.id, item.isActive)}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: item.isActive ? '#f3f4f6' : '#10b981', color: item.isActive ? '#4b5563' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                  >
                    {item.isActive ? "Fermer" : "Réouvrir"}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucune offre d'emploi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
