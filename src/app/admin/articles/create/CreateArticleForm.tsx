"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishArticle } from "@/app/actions/admin";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type Category = { id: string; name: string };

export default function CreateArticleForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await publishArticle(formData);

    if (result.success) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      setError(result.error || "Une erreur est survenue");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>Nouvel Article</h1>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Titre de l'article</label>
          <input 
            type="text" 
            name="title" 
            required 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            placeholder="Ex: Le prix du Cacao en hausse..."
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Catégories</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            {categories.map(cat => (
              <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                <input type="checkbox" name="categories" value={cat.id} style={{ cursor: 'pointer' }} />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Extrait (Chapô)</label>
          <textarea 
            name="excerpt" 
            rows={3}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            placeholder="Court résumé de l'article..."
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Image de couverture</label>
          <input 
            type="file" 
            name="image" 
            accept="image/*"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit', backgroundColor: '#f8fafc' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Contenu HTML de l'article</label>
          <div style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              style={{ height: '400px', marginBottom: '3rem' }} // Add margin bottom because quill toolbar/editor height can overlap
            />
          </div>
          {/* Hidden input to pass content to FormData */}
          <input type="hidden" name="content" value={content} />
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Utilisez l'éditeur pour mettre en forme votre texte, ajouter des liens ou des listes.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
          <input 
            type="checkbox" 
            name="isPremium" 
            id="isPremium"
            style={{ width: '20px', height: '20px' }}
          />
          <label htmlFor="isPremium" style={{ fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>
            ⭐ Marquer cet article comme Premium (Réservé aux abonnés)
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="button"
            onClick={() => router.back()}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem 2rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Publication en cours...' : 'Publier l\'article'}
          </button>
        </div>

      </form>
    </div>
  );
}
