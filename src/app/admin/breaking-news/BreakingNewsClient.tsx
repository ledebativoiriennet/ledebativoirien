"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBreakingNews, toggleBreakingNews } from "@/app/actions/content";

export default function BreakingNewsClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;
    const link = formData.get("link") as string;
    const isActive = formData.get("isActive") === "on";

    const res = await updateBreakingNews(content, link || null, isActive);
    if (res.success) {
      alert("Alerte enregistrée !");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  async function handleToggle(id: string, currentState: boolean) {
    const res = await toggleBreakingNews(id, !currentState);
    if (res.success) router.refresh();
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Nouvelle Alerte Breaking News</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Message de l'alerte</label>
            <input name="content" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Décès de X, situation à Y..." />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Lien optionnel</label>
            <input name="link" type="url" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: /article/titre-article" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" name="isActive" id="isActive" defaultChecked />
            <label htmlFor="isActive" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Activer immédiatement sur le site</label>
          </div>
          <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "..." : "Publier l'alerte"}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem' }}>Contenu</th>
              <th style={{ padding: '1rem' }}>Lien</th>
              <th style={{ padding: '1rem' }}>Statut</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.content}</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{item.link || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  {item.isActive ? (
                    <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>ACTIF</span>
                  ) : (
                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>INACTIF</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => handleToggle(item.id, item.isActive)}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: item.isActive ? '#f3f4f6' : '#10b981', color: item.isActive ? '#4b5563' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {item.isActive ? "Désactiver" : "Activer"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucune alerte enregistrée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
