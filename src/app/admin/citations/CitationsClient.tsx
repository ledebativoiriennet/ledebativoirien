"use client";

import { useState } from "react";
import { createQuote, deleteQuote, toggleQuoteActive } from "@/app/actions/citations";
import { useRouter } from "next/navigation";

type Quote = {
  id: string;
  text: string;
  author: string;
  isActive: boolean;
  createdAt: Date;
};

export default function CitationsClient({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text || !author) return;
    setLoading(true);
    const result = await createQuote(text, author);
    if (result.success && result.quote) {
      setQuotes([result.quote, ...quotes]);
      setText("");
      setAuthor("");
      router.refresh();
    } else {
      alert("Erreur");
    }
    setLoading(false);
  }

  async function handleToggle(id: string) {
    const result = await toggleQuoteActive(id);
    if (result.success) {
      setQuotes(quotes.map(q => {
        if (q.id === id) return { ...q, isActive: true };
        return { ...q, isActive: false }; // Only one active at a time
      }));
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette citation ?")) return;
    const result = await deleteQuote(id);
    if (result.success) {
      setQuotes(quotes.filter(q => q.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ajouter une citation</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <textarea
            placeholder="Texte de la citation"
            value={text}
            onChange={e => setText(e.target.value)}
            className="input"
            style={{ flex: '1 1 100%', minHeight: '80px' }}
            required
          />
          <input
            type="text"
            placeholder="Auteur"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="input"
            style={{ flex: '1 1 300px' }}
            required
          />
          <button type="submit" disabled={loading} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? "..." : "Ajouter"}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Citation</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Auteur</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem' }}>Statut</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', color: '#475569', fontSize: '0.85rem', width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(q => (
              <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontStyle: 'italic' }}>"{q.text}"</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{q.author}</td>
                <td style={{ padding: '1rem' }}>
                  {q.isActive ? (
                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Actif (Aujourd'hui)</span>
                  ) : (
                    <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Inactif</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleToggle(q.id)} disabled={q.isActive} style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem', border: 'none', backgroundColor: q.isActive ? '#e2e8f0' : '#3b82f6', color: q.isActive ? '#94a3b8' : 'white', borderRadius: '4px', cursor: q.isActive ? 'default' : 'pointer' }}>
                    Activer
                  </button>
                  <button onClick={() => handleDelete(q.id)} style={{ padding: '0.3rem 0.6rem', border: 'none', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
