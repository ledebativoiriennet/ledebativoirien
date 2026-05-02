"use client";

import { useState } from "react";
import { createPressRelease, deletePressRelease } from "@/app/actions/communiques";

export default function CommuniquesClient({ items }: { items: any[] }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createPressRelease(formData);
    if (res.success) {
      alert("Communiqué publié avec succès !");
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer ce communiqué ?")) return;
    await deletePressRelease(id);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
      
      {/* Formulaire */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Nouveau Communiqué</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Titre du communiqué *</label>
            <input name="title" required placeholder="Ex: Lancement du nouveau produit..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Entreprise / Institution *</label>
            <input name="company" required placeholder="Ex: Ministère de la Santé, MTN..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Fichier PDF (Optionnel)</label>
            <input type="file" name="file" accept=".pdf,.doc,.docx" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Privilégiez le format PDF.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold' }}>OU</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Lien externe (Si pas de fichier)</label>
            <input type="url" name="url" placeholder="https://..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? "Publication..." : "Publier le communiqué"}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Communiqués Récents</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>{item.title}</div>
                <div style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>{item.company}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')} • {item.url ? <a href={item.url} target="_blank" style={{ textDecoration: 'underline' }}>Voir le document</a> : "Pas de document"}
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Supprimer
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '8px' }}>Aucun communiqué.</div>
          )}
        </div>
      </div>
    </div>
  );
}
