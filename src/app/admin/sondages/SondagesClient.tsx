"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoll, togglePollStatus, deletePoll } from "@/app/actions/content";

export default function SondagesClient({ items }: { items: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optionsCount, setOptionsCount] = useState(2);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const question = formData.get("question") as string;
    
    const options: string[] = [];
    for (let i = 0; i < optionsCount; i++) {
      const opt = formData.get(`option_${i}`) as string;
      if (opt && opt.trim() !== "") {
        options.push(opt.trim());
      }
    }

    if (options.length < 2) {
      alert("Un sondage doit avoir au moins 2 options valides.");
      setLoading(false);
      return;
    }

    const res = await createPoll(question, options);
    if (res.success) {
      alert("Sondage du jour publié !");
      (e.target as HTMLFormElement).reset();
      setOptionsCount(2);
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement : " + (res.error || "Une erreur inconnue est survenue."));
    }
    setLoading(false);
  }

  async function handleToggle(id: string, currentState: boolean) {
    const res = await togglePollStatus(id, !currentState);
    if (res.success) {
      router.refresh();
    } else {
      alert("Erreur : " + (res.error || "Impossible de modifier le statut."));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous supprimer ce sondage ?")) return;
    const res = await deletePoll(id);
    if (res.success) {
      router.refresh();
    } else {
      alert("Erreur : " + (res.error || "Impossible de supprimer le sondage."));
    }
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Créer un nouveau sondage</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Question</label>
            <input name="question" type="text" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: Que pensez-vous du nouveau gouvernement ?" />
          </div>
          
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Options de réponse</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Array.from({ length: optionsCount }).map((_, i) => (
                <input 
                  key={i} 
                  name={`option_${i}`} 
                  type="text" 
                  required={i < 2} 
                  style={{ width: '100%', maxWidth: '400px', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                  placeholder={`Option ${i + 1}`} 
                />
              ))}
            </div>
            <button 
              type="button" 
              onClick={() => setOptionsCount(prev => prev + 1)}
              style={{ marginTop: '0.5rem', padding: '0.4rem 0.8rem', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              + Ajouter une option
            </button>
          </div>
          
          <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
            {loading ? "..." : "Publier le sondage"}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Question</th>
              <th style={{ padding: '1rem' }}>Statut</th>
              <th style={{ padding: '1rem', width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.question}</td>
                <td style={{ padding: '1rem' }}>
                  {item.isActive ? (
                    <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>SONDAGE DU JOUR</span>
                  ) : (
                    <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>ARCHIVÉ</span>
                  )}
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleToggle(item.id, item.isActive)}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: item.isActive ? '#f3f4f6' : '#10b981', color: item.isActive ? '#4b5563' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                  >
                    {item.isActive ? "Désactiver" : "Mettre en avant"}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ padding: '0.4rem 0.8rem', backgroundColor: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem' }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucun sondage enregistré.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
