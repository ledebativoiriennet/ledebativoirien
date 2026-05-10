"use client";

import { useState } from "react";
import { createCompany, deleteCompany } from "@/app/actions/company";

export default function CompanyClient({ items }: { items: any[] }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createCompany(formData);
    if (res.success) {
      alert("Entreprise créée avec succès !");
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette entreprise ? L'action est irréversible et supprimera les accès liés.")) return;
    const res = await deleteCompany(id);
    if (!res.success) {
      alert(res.error || "Une erreur s'est produite lors de la suppression.");
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
      
      {/* Formulaire */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Nouvelle Entreprise</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Nom de l'entreprise *</label>
            <input name="name" required placeholder="Ex: Sillon Technologies" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Email de contact (Unique) *</label>
            <input type="email" name="email" required placeholder="contact@entreprise.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Plan d'abonnement</label>
            <select name="plan" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
              <option value="B2B_STANDARD">B2B Standard</option>
              <option value="B2B_PREMIUM">B2B Premium</option>
              <option value="B2B_ENTERPRISE">B2B Enterprise</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Limite d'utilisateurs</label>
            <input type="number" name="maxUsers" defaultValue="10" min="1" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? "Création..." : "Créer l'entreprise"}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Annuaire des Entreprises</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.name} 
                  <span style={{ fontSize: '0.7rem', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
                    {item.plan}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>{item.email}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
                  <span>👥 Utilisateurs: {item._count.users} / {item.maxUsers}</span>
                  <span>🛒 Achats: {item._count.purchases}</span>
                  <span>📅 Créé le {new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', backgroundColor: '#fee2e2', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Supprimer
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'white', borderRadius: '8px' }}>Aucune entreprise enregistrée.</div>
          )}
        </div>
      </div>
    </div>
  );
}
