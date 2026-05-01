"use client";

import { useState } from "react";
import { manageTeamMember } from "@/app/actions/team";

export default function TeamForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const result = await manageTeamMember(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message || "Opération réussie." });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: "error", text: result.error || "Une erreur est survenue." });
    }
    setLoading(false);
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        Ajouter ou Promouvoir un Membre
      </h2>
      
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
        Entrez l'email du collaborateur. S'il a déjà un compte lecteur, il sera promu. Sinon, un compte lui sera créé (le mot de passe est obligatoire pour les nouveaux comptes).
      </p>

      {message.text && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', fontWeight: 'bold', fontSize: '0.9rem' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Email</label>
            <input type="email" name="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} placeholder="collaborateur@email.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Nom (Optionnel)</label>
            <input type="text" name="name" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} placeholder="Nom complet" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Rôle à attribuer</label>
            <select name="role" required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: 'white' }}>
              <option value="CONTRIBUTOR">Contributeur (Rédige, validation requise)</option>
              <option value="EDITOR">Éditeur (Peut publier et gérer directement)</option>
              <option value="ADMIN">Administrateur (Accès total)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Mot de passe (Nouveau compte)</label>
            <input type="password" name="password" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} placeholder="••••••••" />
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem 2rem', borderRadius: '4px', border: 'none', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Enregistrement..." : "Ajouter / Promouvoir"}
          </button>
        </div>
      </form>
    </div>
  );
}
