"use client";

import React, { useState } from "react";
import { createFlashNews, deleteFlashNews } from "@/app/actions/flashnews";

interface FlashNews {
  id: string;
  time: string;
  content: string;
  link: string | null;
  source: string | null;
  createdAt: Date;
}

export default function FlashNewsClient({ initialFlashNews }: { initialFlashNews: FlashNews[] }) {
  const [news, setNews] = useState<FlashNews[]>(initialFlashNews);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      time: formData.get("time") as string,
      content: formData.get("content") as string,
      link: formData.get("link") as string,
      source: formData.get("source") as string,
    };

    try {
      await createFlashNews(data);
      // Pour une mise à jour locale instantanée sans recharger la page entière
      setNews([{
        id: Math.random().toString(),
        ...data,
        createdAt: new Date()
      }, ...news]);
      (e.target as HTMLFormElement).reset();
      
      // Mettre l'heure courante par défaut
      const now = new Date();
      const timeInput = document.getElementById('time-input') as HTMLInputElement;
      if (timeInput) {
        timeInput.value = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      alert("Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette dépêche ?")) return;
    
    try {
      await deleteFlashNews(id);
      setNews(news.filter(n => n.id !== id));
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  }

  // Obtenir l'heure courante au format HH:MM
  const now = new Date();
  const defaultTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
      {/* Colonne Formulaire */}
      <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", height: "fit-content" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Nouvelle Dépêche</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Heure d'affichage</label>
            <input 
              type="text" 
              name="time" 
              id="time-input"
              defaultValue={defaultTime}
              required 
              placeholder="Ex: 14h30 ou 14:30"
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "4px" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Contenu de l'alerte</label>
            <textarea 
              name="content" 
              required 
              rows={4}
              placeholder="Texte court de l'alerte..."
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "4px", resize: "vertical" }} 
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Lien (Optionnel)</label>
            <input 
              type="url" 
              name="link" 
              placeholder="https://..."
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "4px" }} 
            />
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Pour rediriger vers un article complet</span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Source (Optionnel)</label>
            <input 
              type="text" 
              name="source" 
              placeholder="Ex: AFP, Reuters, Rédaction..."
              style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "4px" }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              backgroundColor: "#ec1a24", 
              color: "white", 
              border: "none", 
              padding: "0.75rem", 
              borderRadius: "4px", 
              fontWeight: "bold", 
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? "Publication..." : "Publier l'alerte"}
          </button>
        </form>
      </div>

      {/* Colonne Liste */}
      <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Historique des dépêches</h2>
        
        {news.length === 0 ? (
          <p style={{ color: "#64748b" }}>Aucune dépêche pour le moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {news.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "4px", borderLeft: "4px solid #ec1a24" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "bold", color: "#ec1a24" }}>{item.time}</span>
                    {item.source && <span style={{ fontSize: "0.7rem", backgroundColor: "#f1f5f9", padding: "0.1rem 0.3rem", borderRadius: "2px", color: "#475569" }}>{item.source}</span>}
                  </div>
                  <p style={{ fontSize: "0.9rem", margin: 0 }}>{item.content}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#3b82f6", display: "block", marginTop: "0.5rem" }}>
                      🔗 Lien rattaché
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ backgroundColor: "transparent", color: "#ef4444", border: "none", cursor: "pointer", padding: "0.5rem", fontWeight: "bold" }}
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
