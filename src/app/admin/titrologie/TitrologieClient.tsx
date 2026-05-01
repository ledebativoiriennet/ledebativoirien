"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadTitrologie, deleteTitrologie } from "@/app/actions/content";

export default function TitrologieClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await uploadTitrologie(formData);
    if (res.success) {
      alert("Une de journal ajoutée !");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert(res.error || "Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer cette une ?")) return;
    const res = await deleteTitrologie(id);
    if (res.success) router.refresh();
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ajouter une Une (Titrologie)</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Nom du journal</label>
            <input name="newspaperName" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Fraternité Matin" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Date de parution</label>
            <input name="date" type="date" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Image de la Une</label>
            <input name="image" type="file" accept="image/*" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "..." : "Uploader"}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {items.map(item => (
          <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ height: '250px', backgroundColor: '#f1f5f9', position: 'relative' }}>
              <img src={item.imageUrl} alt={item.newspaperName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>{new Date(item.date).toLocaleDateString('fr-FR')}</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem' }}>{item.newspaperName}</div>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ padding: '0.4rem 0.8rem', backgroundColor: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', width: '100%' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '8px' }}>Aucune une de journal enregistrée.</div>
        )}
      </div>
    </div>
  );
}
