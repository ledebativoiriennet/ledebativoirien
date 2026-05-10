"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { publishArticle } from "@/app/actions/admin";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import Link from "next/link";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

// quillModules are now defined inside the component using useMemo

type Category = { id: string; name: string };

export default function CreateArticleForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const quillRef = useRef<any>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (data.url) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', data.url);
        } else {
          alert('Erreur: ' + (data.error || 'Upload failed'));
        }
      } catch (e) {
        console.error(e);
        alert('Upload failed');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
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
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await publishArticle(formData);

      if (result.success) {
        alert("✅ Article publié avec succès !");
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
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>Nouvel Article</h1>

      {isSuccess && (
        <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 0.5rem 0' }}>✅ Article publié avec succès !</h2>
          <p style={{ marginBottom: '1rem' }}>Que souhaitez-vous faire maintenant ?</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setIsSuccess(false);
                setContent("");
                // Reset form
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) form.reset();
              }}
              style={{ padding: '0.6rem 1.2rem', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ➕ Créer un nouvel article
            </button>
            <Link 
              href="/admin/articles"
              style={{ padding: '0.6rem 1.2rem', backgroundColor: 'white', color: '#166534', border: '1px solid #166534', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none' }}
            >
              📋 Retour à la liste
            </Link>
          </div>
        </div>
      )}

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
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Catégories (Maintenez Ctrl/Cmd pour en sélectionner plusieurs)</label>
          <select 
            multiple 
            name="categories" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', minHeight: '120px' }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} style={{ padding: '0.25rem' }}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Tags / Mots-clés (séparés par des virgules)</label>
          <input 
            type="text" 
            name="tags" 
            placeholder="Ex: Cacao, Economie, Exportation..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
          />
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Les tags s'afficheront en #tendances sur la page d'accueil.</p>
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
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Image de couverture (Fichier depuis l'ordinateur)</label>
          <input 
            type="file" 
            name="image" 
            accept="image/*"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit', backgroundColor: '#f8fafc', marginBottom: '0.5rem' }}
          />
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>OU Lien vers une image (URL ex: https://...)</label>
          <input 
            type="url" 
            name="imageUrlLink" 
            placeholder="https://..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Légende / Crédit photo</label>
          <input
            type="text"
            name="imageCaption"
            placeholder="Ex: Photo AFP / Reuters — Abidjan, mai 2026"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit', color: '#64748b' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Cette légende apparaîtra sous l’image dans l’article.</p>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Vidéo de l'article (Optionnel)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Upload un fichier vidéo</label>
              <input 
                type="file" 
                name="videoFile" 
                accept="video/*"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>OU Lien Vidéo (YouTube, etc.)</label>
              <input 
                type="url" 
                name="videoUrl" 
                placeholder="https://www.youtube.com/watch?v=..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Légende / Crédit vidéo</label>
          <input
            type="text"
            name="videoCaption"
            placeholder="Ex: Source : RFI — Reportage exclusif"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit', color: '#64748b' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Cette légende apparaîtra sous la vidéo dans l’article.</p>
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Contenu HTML de l'article</label>
          <div style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            {/* @ts-ignore */}
            <ReactQuill 
              ref={quillRef}
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules}
              style={{ height: '400px', marginBottom: '3rem' }} // Add margin bottom because quill toolbar/editor height can overlap
            />
          </div>
          {/* Hidden input to pass content to FormData */}
          <input type="hidden" name="content" value={content} />
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Utilisez l'éditeur pour mettre en forme votre texte, ajouter des liens ou des listes.</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="isPremium" 
              id="isPremium"
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isPremium" style={{ fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>
              Article Premium (Réservé aux abonnés)
            </label>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="isAudioAvailable" 
              id="isAudioAvailable"
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isAudioAvailable" style={{ fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>
              🎙️ Rendre disponible en audio (Actu Audio)
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="isConfidentiel" 
              id="isConfidentiel"
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isConfidentiel" style={{ fontWeight: 'bold', color: '#0f172a', cursor: 'pointer' }}>
              🔒 Format Confidentiel
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="isFeatured" 
              id="isFeatured"
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isFeatured" style={{ fontWeight: 'bold', color: '#1d4ed8', cursor: 'pointer' }}>
              ⭐️ Mettre en avant (Une)
            </label>
          </div>
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
