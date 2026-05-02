"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateArticle } from "@/app/actions/admin";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import Link from "next/link";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }, { 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

type Category = { id: string; name: string };

export default function EditArticleForm({ article, categories }: { article: any, categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState(article.content || "");
  const articleCategoryIds = article.categories.map((c: any) => c.id);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateArticle(article.id, formData);

      if (result.success) {
        alert("Succès ! L'article a été mis à jour.");
        router.push("/admin/articles");
        router.refresh();
      } else {
        setError(result.error || "Une erreur est survenue côté serveur");
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Erreur réseau ou fichier trop lourd. Impossible de joindre le serveur.");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Modifier l'article</h1>
        <Link href={`/article/${article.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
          👁️ Visualiser
        </Link>
      </div>

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
            defaultValue={article.title}
            required 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Catégories</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            {categories.map(cat => (
              <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                <input 
                  type="checkbox" 
                  name="categories" 
                  value={cat.id} 
                  defaultChecked={articleCategoryIds.includes(cat.id)}
                  style={{ cursor: 'pointer' }} 
                />
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
            defaultValue={article.excerpt || ""}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Image de couverture (Fichier depuis l'ordinateur)</label>
          {article.imageUrl && (
            <div style={{ marginBottom: '0.5rem' }}>
              <img src={article.imageUrl} alt="Couverture" style={{ height: '100px', borderRadius: '4px', objectFit: 'cover' }} />
              <input type="hidden" name="existingImageUrl" value={article.imageUrl} />
            </div>
          )}
          <input 
            type="file" 
            name="image" 
            accept="image/*"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit', backgroundColor: '#f8fafc', marginBottom: '0.5rem' }}
          />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>OU Lien vers une image (Nouveau lien externe)</label>
          <input 
            type="url" 
            name="imageUrlLink" 
            placeholder="https://..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Contenu HTML de l'article</label>
          <div style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={quillModules}
              style={{ height: '400px', marginBottom: '3rem' }}
            />
          </div>
          <input type="hidden" name="content" value={content} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
          <input 
            type="checkbox" 
            name="isPremium" 
            id="isPremium"
            defaultChecked={article.isPremium}
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
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

      </form>
    </div>
  );
}
