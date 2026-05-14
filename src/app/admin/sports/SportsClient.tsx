"use client";

import { useState } from "react";
import { createMatch, updateMatchScore, deleteMatch } from "@/app/actions/sports";

export default function SportsClient({ initialMatches }: { initialMatches: any[] }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      team1: formData.get("team1") as string,
      team2: formData.get("team2") as string,
      team1Flag: formData.get("team1Flag") as string,
      team2Flag: formData.get("team2Flag") as string,
      matchDate: new Date(formData.get("matchDate") as string),
      phase: formData.get("phase") as string,
      sport: formData.get("sport") as string,
      sportIcon: formData.get("sportIcon") as string,
    };

    try {
      await createMatch(data);
      alert("Match ajouté !");
      (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      alert("Erreur : " + e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
      {/* Formulaire */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignSelf: 'start' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a' }}>Nouveau Match</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Équipe 1</label>
              <input type="text" name="team1" required placeholder="Ex: Côte d'Ivoire" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Drapeau</label>
              <input type="text" name="team1Flag" placeholder="🇨🇮" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Équipe 2</label>
              <input type="text" name="team2" required placeholder="Ex: Sénégal" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Drapeau</label>
              <input type="text" name="team2Flag" placeholder="🇸🇳" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Date et Heure du Match</label>
            <input type="datetime-local" name="matchDate" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Phase / Compétition</label>
            <input type="text" name="phase" placeholder="Ex: CAN 2025 - Groupe A" style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Sport (Nom)</label>
              <input type="text" name="sport" defaultValue="Football" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '80px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Icône</label>
              <input type="text" name="sportIcon" defaultValue="⚽" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Enregistrement...' : 'Ajouter le match'}
          </button>
        </form>
      </div>

      {/* Liste des matchs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {initialMatches.map(match => (
          <div key={match.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{match.sportIcon}</span>
                {match.sport} • {match.phase} • {new Date(match.matchDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', backgroundColor: match.status === 'LIVE' ? '#fee2e2' : '#f1f5f9', color: match.status === 'LIVE' ? '#dc2626' : '#475569' }}>
                  {match.status}
                </span>
                <button onClick={() => { if(confirm('Supprimer ce match ?')) deleteMatch(match.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <span style={{ fontSize: '1.5rem' }}>{match.team1Flag}</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{match.team1}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }}>
                <input 
                  type="text" 
                  defaultValue={match.score || "-"} 
                  onBlur={(e) => updateMatchScore(match.id, e.target.value, match.status)}
                  style={{ width: '60px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', padding: '0.2rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{match.team2}</span>
                <span style={{ fontSize: '1.5rem' }}>{match.team2Flag}</span>
              </div>
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button onClick={() => updateMatchScore(match.id, match.score || "-", "UPCOMING")} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>À venir</button>
              <button onClick={() => updateMatchScore(match.id, match.score || "-", "LIVE")} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>En direct</button>
              <button onClick={() => updateMatchScore(match.id, match.score || "-", "FINISHED")} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '4px', cursor: 'pointer' }}>Terminé</button>
            </div>
          </div>
        ))}
        {initialMatches.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', textAlign: 'center', borderRadius: '8px', color: '#64748b' }}>
            Aucun match n'a été programmé.
          </div>
        )}
      </div>
    </div>
  );
}
