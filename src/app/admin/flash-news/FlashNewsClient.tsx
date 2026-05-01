"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFlashNews, deleteFlashNews } from "@/app/actions/content";

export default function FlashNewsClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const time = formData.get("time") as string;
    const content = formData.get("content") as string;
    const source = formData.get("source") as string;

    const res = await createFlashNews(time, content, source || null);
    if (res.success) {
      alert("Dépêche ajoutée !");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer cette dépêche ?")) return;
    const res = await deleteFlashNews(id);
    if (res.success) router.refresh();
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ajouter une Flash Info</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Heure</label>
            <input name="time" type="time" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} defaultValue={new Date().toTimeString().slice(0,5)} />
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Contenu bref de la dépêche</label>
            <input name="content" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Le gouvernement annonce..." />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Source (Optionnel)</label>
            <input name="source" type="text" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: AFP, AIP" />
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
              <th style={{ padding: '1rem' }}>Heure</th>
              <th style={{ padding: '1rem' }}>Contenu</th>
              <th style={{ padding: '1rem' }}>Source</th>
              <th style={{ padding: '1rem', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold', color: '#dc2626' }}>{item.time}</td>
                <td style={{ padding: '1rem' }}>{item.content}</td>
                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{item.source || '-'}</td>
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
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucune Flash Info enregistrée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
