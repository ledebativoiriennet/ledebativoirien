"use client";

import { useState } from "react";
import { createCategory, deleteCategory } from "@/app/actions/category";

export default function CategoryClient({ items }: { items: any[] }) {
  const [loading, setLoading] = useState(false);
  const [deleteModeId, setDeleteModeId] = useState<string | null>(null);
  const [transferCatId, setTransferCatId] = useState<string>("");

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

  const confirmDelete = async (id: string) => {
    setLoading(true);
    const res = await deleteCategory(id, transferCatId || undefined);
    if (!res.success) {
      alert(res.error || "Une erreur s'est produite lors de la suppression.");
    } else {
      setDeleteModeId(null);
      setTransferCatId("");
    }
    setLoading(false);
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
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                {deleteModeId !== item.id && (
                  <button onClick={() => setDeleteModeId(item.id)} style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Supprimer
                  </button>
                )}
              </div>

              {deleteModeId === item.id && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                  <p style={{ fontWeight: 'bold', color: '#be123c', marginBottom: '0.5rem' }}>⚠️ Attention, cette action est irréversible.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#881337' }}>
                      Transférer les articles vers une autre catégorie (Optionnel) :
                    </label>
                    <select 
                      value={transferCatId} 
                      onChange={(e) => setTransferCatId(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #fda4af' }}
                    >
                      <option value="">-- Supprimer les liens sans transférer --</option>
                      {items.filter(c => c.id !== item.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => confirmDelete(item.id)} disabled={loading} style={{ backgroundColor: '#e11d48', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {loading ? "Suppression..." : "Confirmer la suppression"}
                      </button>
                      <button onClick={() => { setDeleteModeId(null); setTransferCatId(""); }} disabled={loading} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
