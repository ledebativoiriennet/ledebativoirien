"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { publishArticle, searchArticlesForSelection } from "@/app/actions/admin";
import { createCategory } from "@/app/actions/category";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const TipTapEditor = dynamic(() => import("@/components/admin/TipTapEditor"), { ssr: false });

type Category = { id: string; name: string };

export default function CreateArticleForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // New Category State
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // SEO & Related Articles State
  const [selectedRelated, setSelectedRelated] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-save logic
  useEffect(() => {
    const timer = setInterval(() => {
      const data = {
        title: (document.getElementsByName("title")[0] as any)?.value,
        excerpt: (document.getElementsByName("excerpt")[0] as any)?.value,
        content,
        seoTitle: (document.getElementsByName("seoTitle")[0] as any)?.value,
        seoDescription: (document.getElementsByName("seoDescription")[0] as any)?.value,
        timestamp: Date.now()
      };
      localStorage.setItem("article-draft-new", JSON.stringify(data));
      console.log("Draft auto-saved");
    }, 30000);
    return () => clearInterval(timer);
  }, [content]);

  useEffect(() => {
    const saved = localStorage.getItem("article-draft-new");
    if (saved) {
      const data = JSON.parse(saved);
      if (window.confirm(`Un brouillon non publié du ${new Date(data.timestamp).toLocaleString()} a été trouvé. Voulez-vous le restaurer ?`)) {
        // Use a slight delay or ref to avoid cascading render warning on mount
        const restore = () => {
          setContent(data.content);
          if (data.title) {
            const el = document.getElementsByName("title")[0] as any;
            if (el) el.value = data.title;
          }
          if (data.excerpt) {
            const el = document.getElementsByName("excerpt")[0] as any;
            if (el) el.value = data.excerpt;
          }
          if (data.seoTitle) {
            const el = document.getElementsByName("seoTitle")[0] as any;
            if (el) el.value = data.seoTitle;
          }
          if (data.seoDescription) {
            const el = document.getElementsByName("seoDescription")[0] as any;
            if (el) el.value = data.seoDescription;
          }
        };
        restore();
      }
    }
  }, []);

  const handleSearchArticles = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchArticlesForSelection(query);
    setSearchResults(results.filter(r => !selectedRelated.find(sr => sr.id === r.id)));
    setIsSearching(false);
  };

  const addRelated = (art: any) => {
    setSelectedRelated([...selectedRelated, art]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const removeRelated = (id: string) => {
    setSelectedRelated(selectedRelated.filter(r => r.id !== id));
  };

  const handlePreview = () => {
    const data = {
      title: (document.getElementsByName("title")[0] as any)?.value,
      excerpt: (document.getElementsByName("excerpt")[0] as any)?.value,
      content,
      imageUrl: "", // Can't easily preview uploaded file without temporary storage, but fine for text
      categories: []
    };
    localStorage.setItem("article-preview", JSON.stringify(data));
    window.open("/admin/articles/preview", "_blank");
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    const fd = new FormData();
    fd.append("name", newCatName);
    
    const res = await createCategory(fd);
    if (res.success && res.category) {
      setLocalCategories([...localCategories, res.category as Category]);
      setShowNewCat(false);
      setNewCatName("");
    } else {
      alert(res.error || "Erreur de création");
    }
    setCreatingCat(false);
  };

  // imageHandler & modules are now handled inside TipTapEditor

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await publishArticle(formData);

      if (result.success) {
        setIsSuccess(true);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        localStorage.removeItem("article-draft-new");
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Lien personnalisé (Slug)</label>
            <input 
              type="text" 
              name="slug" 
              placeholder="votre-titre-personnalise"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Laissez vide pour générer automatiquement à partir du titre.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Titre de l&apos;article</label>
            <input 
              type="text" 
              name="title" 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
              placeholder="Ex: Le prix du Cacao en hausse..."
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Date de publication (Planning)</label>
            <input 
              type="datetime-local" 
              name="publishedAt" 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Laissez vide pour publier maintenant.</p>
          </div>
          <div>
             <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Date de création</label>
            <input 
              type="datetime-local" 
              name="createdAt" 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
             <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Date affichée sur l'article.</p>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#475569' }}>Catégories (Maintenez Ctrl/Cmd pour en sélectionner plusieurs)</label>
            <button 
              type="button" 
              onClick={() => setShowNewCat(!showNewCat)}
              style={{ fontSize: '0.8rem', backgroundColor: '#e0e7ff', color: '#4338ca', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Nouvelle Catégorie
            </button>
          </div>

          {showNewCat && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e1' }}>
              <input 
                type="text" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nom de la catégorie..."
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
              <button 
                type="button" 
                onClick={handleCreateCategory}
                disabled={creatingCat || !newCatName.trim()}
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: (creatingCat || !newCatName.trim()) ? 'not-allowed' : 'pointer' }}
              >
                {creatingCat ? '...' : 'Ajouter'}
              </button>
            </div>
          )}

          <select 
            multiple 
            name="categories" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', minHeight: '120px' }}
          >
            {localCategories.map(cat => (
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
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Les tags s&apos;afficheront en #tendances sur la page d&apos;accueil.</p>
        </div>

        <div style={{ backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔍 Optimisation SEO
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Titre SEO (Meta Title)</label>
              <input 
                type="text" 
                name="seoTitle" 
                placeholder="Titre apparaissant dans Google..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Description SEO (Meta Description)</label>
              <textarea 
                name="seoDescription" 
                rows={2}
                placeholder="Court résumé pour les moteurs de recherche..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fcfafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fce7f3' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#be185d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔗 Articles Liés (Manuels)
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchArticles(e.target.value)}
              placeholder="Rechercher un article à lier..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
            {isSearching && <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Recherche...</p>}
            {searchResults.length > 0 && (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  {searchResults.map(art => (
                    <div 
                      key={art.id} 
                      onClick={() => addRelated(art)}
                      style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                    >
                      {art.title} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : 'Brouillon'})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {selectedRelated.map(art => (
              <div key={art.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fdf2f8', color: '#9d174d', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #fbcfe8' }}>
                {art.title}
                <button 
                  type="button" 
                  onClick={() => removeRelated(art.id)}
                  style={{ border: 'none', background: 'none', color: '#be185d', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input type="hidden" name="relatedArticleIds" value={selectedRelated.map(r => r.id).join(',')} />
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
          <TipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Rédigez le contenu de l'article ici..."
            minHeight="500px"
          />
          {/* Hidden input to pass content to FormData */}
          <input type="hidden" name="content" value={content} />
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Utilisez l&apos;éditeur pour mettre en forme votre texte, ajouter des liens, des images ou des vidéos.</p>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="isLiveBlog" 
              id="isLiveBlog"
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isLiveBlog" style={{ fontWeight: 'bold', color: '#dc2626', cursor: 'pointer' }}>
              🔴 Activer le Live Blog
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📢 Partage sur les réseaux sociaux
          </h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="publishToFb" id="publishToFb" style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
              <label htmlFor="publishToFb" style={{ fontWeight: 'bold', color: '#1877F2', cursor: 'pointer' }}>Facebook</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="publishToTwitter" id="publishToTwitter" style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
              <label htmlFor="publishToTwitter" style={{ fontWeight: 'bold', color: '#000000', cursor: 'pointer' }}>X (Twitter)</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="publishToLinkedin" id="publishToLinkedin" style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} />
              <label htmlFor="publishToLinkedin" style={{ fontWeight: 'bold', color: '#0A66C2', cursor: 'pointer' }}>LinkedIn</label>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#1e40af', margin: 0 }}>
            Note: Assurez-vous d'avoir configuré les clés API dans les paramètres "Réseaux Sociaux".
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="button"
            onClick={handlePreview}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #6366f1', backgroundColor: '#eef2ff', color: '#4338ca', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Aperçu en direct
          </button>
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
