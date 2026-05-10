"use client";

import { useState } from "react";
import { createAuthor, deleteAuthor } from "@/app/actions/author";

export default function AuthorClient({ items }: { items: any[] }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createAuthor(formData);
    if (res.success) {
      alert("Auteur créé avec succès !");
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet auteur ? L'action est irréversible.")) return;
    const res = await deleteAuthor(id);
    if (!res.success) {
      alert(res.error || "Une erreur s'est produite lors de la suppression.");
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
      
      {/* Formulaire */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Nouveau Profil Auteur</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Nom d'affichage *</label>
            <input name="name" required placeholder="Ex: Jean Dupont" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Email de connexion (Optionnel)</label>
            <input type="email" name="email" placeholder="jean.dupont@ledebativoirien.net" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Renseignez l'email utilisé par le journaliste pour se connecter afin de lier ses articles automatiquement.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? "Création..." : "Créer l'auteur"}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Liste des Rédacteurs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>{item.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>{item.email || 'Aucun email associé'}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
                  <span>📝 Articles publiés: {item._count.articles}</span>
                  <span>👥 Abonnés: {item._count.subscribers}</span>
                  <span>🔗 Slug: {item.slug}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Supprimer
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '8px' }}>Aucun auteur enregistré.</div>
          )}
        </div>
      </div>
    </div>
  );
}
