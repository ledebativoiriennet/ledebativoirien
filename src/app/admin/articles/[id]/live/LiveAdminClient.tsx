"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

export default function LiveAdminClient({ article, initialUpdates }: { article: any, initialUpdates: any[] }) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("La Rédaction");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const quillRef = useRef<any>(null);

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content === "<p><br></p>") return;

    setLoading(true);
    try {
      const res = await fetch(`/api/live-blog/${article.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, author, createdAt: new Date() }),
      });

      if (res.ok) {
        const newUpdate = await res.json();
        setUpdates([newUpdate, ...updates]);
        setContent("");
        router.refresh();
      } else {
        alert("Erreur lors de l'ajout.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette mise à jour ?")) return;
    try {
      const res = await fetch(`/api/live-blog/${article.id}?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUpdates(updates.filter(u => u.id !== id));
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#dc2626', margin: 0 }}>🔴 Live Blog</h1>
          <p style={{ color: '#475569', marginTop: '0.5rem', fontWeight: 'bold' }}>{article.title}</p>
        </div>
        <Link href={`/article/${article.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
          👁️ Voir sur le site
        </Link>
      </div>

      {/* Formulaire d'ajout */}
      <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: '0 0 1rem 0' }}>Ajouter une mise à jour</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Auteur (Optionnel)</label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex: La Rédaction, John Doe..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Message</label>
            <div style={{ backgroundColor: 'white', borderRadius: '4px' }}>
              {/* @ts-ignore */}
              <ReactQuill 
                ref={quillRef}
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                style={{ height: '200px', marginBottom: '3rem' }}
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading || !content.trim() || content === "<p><br></p>"}
            style={{ padding: '0.75rem 2rem', borderRadius: '4px', border: 'none', backgroundColor: '#dc2626', color: 'white', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !content.trim()) ? 0.7 : 1 }}
          >
            {loading ? 'Envoi...' : 'Envoyer la mise à jour'}
          </button>
        </form>
      </div>

      {/* Liste des mises à jour */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
          Mises à jour précédentes ({updates.length})
        </h2>
        {updates.length === 0 ? (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Aucune mise à jour pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {updates.map(update => (
              <div key={update.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 'bold', color: '#dc2626' }}>
                    {new Date(update.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {update.authorName && <span style={{ color: '#475569', marginLeft: '0.5rem' }}>- par {update.authorName}</span>}
                  </div>
                  <button 
                    onClick={() => handleDelete(update.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                  >
                    Supprimer
                  </button>
                </div>
                <div 
                  dangerouslySetInnerHTML={{ __html: update.content }}
                  style={{ fontSize: '1rem', lineHeight: '1.5' }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
