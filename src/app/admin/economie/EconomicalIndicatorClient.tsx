"use client";

import { useState } from "react";
import { createEconomicalIndicator, deleteEconomicalIndicator } from "@/app/actions/economical-indicator";

export default function EconomicalIndicatorClient({ items }: { items: any[] }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createEconomicalIndicator(formData);
    if (res.success) {
      alert("Indicateur ajouté avec succès !");
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cet indicateur ?")) return;
    const res = await deleteEconomicalIndicator(id);
    if (!res.success) {
      alert(res.error || "Erreur de suppression.");
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
      
      {/* Formulaire */}
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Nouvel Indicateur</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Pays / Zone *</label>
            <input name="country" required placeholder="Ex: Côte d'Ivoire, UEMOA..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Catégorie *</label>
            <select name="category" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
              <option value="PIB">PIB</option>
              <option value="Croissance">Croissance</option>
              <option value="Inflation">Inflation</option>
              <option value="Dette Publique">Dette Publique</option>
              <option value="Population">Population</option>
              <option value="Taux de Chômage">Taux de Chômage</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Valeur *</label>
              <input name="value" required placeholder="Ex: 7.5, 43..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Unité</label>
              <input name="unit" placeholder="Ex: %, Milliards FCFA..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Année *</label>
              <input type="number" name="year" required defaultValue={new Date().getFullYear()} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Tendance</label>
              <select name="trend" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                <option value="">Neutre (FLAT)</option>
                <option value="UP">Hausse (UP)</option>
                <option value="DOWN">Baisse (DOWN)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Source des données</label>
            <input name="source" placeholder="Ex: Banque Mondiale, FMI..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? "Enregistrement..." : "Enregistrer l'indicateur"}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', paddingLeft: '1rem' }}>Indicateurs Actuels</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Pays</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Catégorie</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Valeur</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Année</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#0f172a' }}>{item.country}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    {item.value} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.unit}</span>
                    {item.trend === 'UP' && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>↗</span>}
                    {item.trend === 'DOWN' && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>↘</span>}
                  </td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{item.year}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucun indicateur.</div>
          )}
        </div>
      </div>
    </div>
  );
}
