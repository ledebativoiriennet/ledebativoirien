"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "@/app/actions/category";

export default function CategoryClient({ items }: { items: any[] }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createCategory(formData);
    if (res.success) {
      alert("Catégorie créée avec succès !");
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette catégorie ? L'action est irréversible.")) return;
    const res = await deleteCategory(id);
    if (!res.success) {
      alert(res.error || "Une erreur s'est produite lors de la suppression.");
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
      
      {/* Formulaire */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Nouvelle Catégorie</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Nom de la catégorie *</label>
            <input name="name" required placeholder="Ex: Technologie" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Catégorie parente (Optionnel)</label>
            <select name="parentId" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
              <option value="">-- Aucune (Catégorie principale) --</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? "Création..." : "Créer la catégorie"}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Liste des Catégories</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.name}
                  {item.parent && <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}> (Sous: {item.parent.name})</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
                  <span>📝 Articles associés: {item._count.articles}</span>
                  <span>📂 Sous-catégories: {item._count.children}</span>
                  <span>🔗 Slug: {item.slug}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Supprimer
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '8px' }}>Aucune catégorie enregistrée.</div>
          )}
        </div>
      </div>
    </div>
  );
}
