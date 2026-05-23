"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadCaricature, deleteCaricature } from "@/app/actions/content";

export default function CaricaturesClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await uploadCaricature(formData);
    if (res.success) {
      alert("Caricature ajoutée !");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert(res.error || "Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer cette caricature ?")) return;
    const res = await deleteCaricature(id);
    if (res.success) router.refresh();
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ajouter une Caricature</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Titre de la caricature</label>
            <input name="title" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: La caricature du jour" />
          </div>
          <div style={{ flex: '1 1 250px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Image</label>
            <input name="image" type="file" accept="image/*" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "..." : "Uploader"}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {items.map(item => (
          <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <div style={{ height: '200px', backgroundColor: '#f1f5f9', position: 'relative' }}>
              <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f1f5f9' }} />
            </div>
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem' }}>{item.title}</div>
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
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '8px' }}>Aucune caricature enregistrée.</div>
        )}
      </div>
    </div>
  );
}
