"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadActivity, deleteActivity } from "@/app/actions/content";

export default function AgendaClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await uploadActivity(formData);
    if (res.success) {
      alert("Activité ajoutée à l'agenda !");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert(res.error || "Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer cette activité ?")) return;
    const res = await deleteActivity(id);
    if (res.success) router.refresh();
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ajouter une activité</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Titre de l'événement</label>
            <input name="title" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Concert de la Paix" />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Date (texte)</label>
            <input name="date" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: 15 Août 2026" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Lieu</label>
            <input name="location" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Palais de la Culture" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Lien optionnel</label>
            <input name="link" type="url" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: https://..." />
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Image de couverture</label>
            <input name="image" type="file" accept="image/*" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "..." : "Ajouter"}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', width: '80px' }}>Image</th>
              <th style={{ padding: '1rem' }}>Titre</th>
              <th style={{ padding: '1rem' }}>Date & Lieu</th>
              <th style={{ padding: '1rem', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                  )}
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.title}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <div>📅 {item.date}</div>
                  <div>📍 {item.location}</div>
                </td>
                <td style={{ padding: '1rem' }}>
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
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucune activité dans l'agenda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
