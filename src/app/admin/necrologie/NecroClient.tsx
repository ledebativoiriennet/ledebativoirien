"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createObituary, deleteObituary } from "@/app/actions/content";

export default function NecroClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await createObituary(formData);
    if (res.success) {
      alert("Avis de décès publié !");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert(res.error || "Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer cet avis ?")) return;
    const res = await deleteObituary(id);
    if (res.success) router.refresh();
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ajouter un avis de décès</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Nom complet du défunt</label>
            <input name="name" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: M. Jean Dupont" />
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Détails (Âge, profession, dates clés)</label>
            <input name="details" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Décédé le 10 août à l'âge de 80 ans" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Photo (Optionnelle)</label>
            <input name="image" type="file" accept="image/*" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 2rem', backgroundColor: '#1f2937', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "..." : "Publier"}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {items.map(item => (
          <div key={item.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '1rem', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : "✝️"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', lineHeight: 1.3 }}>{item.details}</div>
              <button 
                onClick={() => handleDelete(item.id)}
                style={{ padding: '0.2rem 0.5rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '8px' }}>Aucun avis de décès.</div>
        )}
      </div>
    </div>
  );
}
