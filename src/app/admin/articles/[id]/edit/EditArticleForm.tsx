"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateArticle, searchArticlesForSelection } from "@/app/actions/admin";
import { createCategory } from "@/app/actions/category";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import Link from "next/link";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false }) as any;

// quillModules are now defined inside the component using useMemo

type Category = { id: string; name: string };

export default function EditArticleForm({ article, categories }: { article: any, categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState(article.content || "");
  const articleCategoryIds = article.categories.map((c: any) => c.id);
  const quillRef = useRef<any>(null);

  // New Category State
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // SEO & Related Articles State
  const [selectedRelated, setSelectedRelated] = useState<any[]>(article.relatedArticles || []);
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
      localStorage.setItem(`article-draft-${article.id}`, JSON.stringify(data));
      console.log("Draft auto-saved");
    }, 30000); // 30 seconds
    return () => clearInterval(timer);
  }, [content, article.id]);

  useEffect(() => {
    const saved = localStorage.getItem(`article-draft-${article.id}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (window.confirm(`Un brouillon enregistré le ${new Date(data.timestamp).toLocaleString()} a été trouvé. Voulez-vous le restaurer ?`)) {
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
      }
    }
  }, [article.id]);

  const handleSearchArticles = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchArticlesForSelection(query, article.id);
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
      imageUrl: article.imageUrl,
      categories: article.categories
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

  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Modifier l&apos;article</h1>
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Lien personnalisé (Slug)</label>
            <input 
              type="text" 
              name="slug" 
              defaultValue={article.slug}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Titre de l&apos;article</label>
            <input 
              type="text" 
              name="title" 
              defaultValue={article.title}
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        <div style={{ backgroundColor: '#fdf4ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#a21caf', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🤖 Innovations IA & Audio
          </h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Résumé Intelligent (IA)</label>
                <button type="button" onClick={() => alert("Simulation: Résumé généré par l'IA !")} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', backgroundColor: '#d946ef', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Générer par IA</button>
              </div>
              <textarea 
                name="aiSummary" 
                defaultValue={article.aiSummary || ""}
                rows={3}
                placeholder="En Bref : 3 points clés générés par IA..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Lien Audio (Génération vocale)</label>
                <button type="button" onClick={() => alert("Simulation: Piste audio générée ! /api/audio/mock.mp3")} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', backgroundColor: '#a21caf', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Créer Piste Audio</button>
              </div>
              <input 
                type="url" 
                name="audioUrl" 
                defaultValue={article.audioUrl || ""}
                placeholder="https://.../audio.mp3"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Date de publication (Planning)</label>
            <input 
              type="datetime-local" 
              name="publishedAt" 
              defaultValue={formatDateForInput(article.publishedAt)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Planifiez la sortie de l'article.</p>
          </div>
          <div>
             <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Date de création</label>
            <input 
              type="datetime-local" 
              name="createdAt" 
              defaultValue={formatDateForInput(article.createdAt)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
             <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Affecte le tri chronologique.</p>
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
            defaultValue={articleCategoryIds}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: 'white', minHeight: '120px' }}
          >
            {localCategories.map(cat => (
              <option key={cat.id} value={cat.id} style={{ padding: '0.25rem' }}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Tags / Mots-clés (séparés par des virgules)</label>
            <input 
              type="text" 
              name="tags" 
              defaultValue={article.tags?.map((t: any) => t.name).join(', ')}
              placeholder="Ex: Cacao, Economie, Exportation..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Les tags s'afficheront en #tendances sur la page d'accueil.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Région (Carte Interactive)</label>
            <select name="region" defaultValue={article.region || ""} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'inherit' }}>
              <option value="">Aucune (Nationale)</option>
              <option value="Abidjan">Abidjan</option>
              <option value="Yamoussoukro">Yamoussoukro</option>
              <option value="Bouaké">Bouaké</option>
              <option value="San-Pédro">San-Pédro</option>
              <option value="Korhogo">Korhogo</option>
              <option value="Daloa">Daloa</option>
              <option value="Man">Man</option>
            </select>
          </div>
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
                defaultValue={article.seoTitle || ""}
                placeholder="Titre apparaissant dans Google..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Description SEO (Meta Description)</label>
              <textarea 
                name="seoDescription" 
                defaultValue={article.seoDescription || ""}
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
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Légende / Crédit photo</label>
          <input
            type="text"
            name="imageCaption"
            defaultValue={article.imageCaption || ''}
            placeholder="Ex: Photo AFP / Reuters — Abidjan, mai 2026"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit', color: '#64748b' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Cette légende apparaîtra sous l’image dans l’article.</p>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Vidéo de l'article (Optionnel)</label>
          {article.videoFile && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569' }}>Vidéo actuelle (uploadée) :</p>
              <video src={article.videoFile} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '4px' }} />
              <input type="hidden" name="existingVideoFile" value={article.videoFile} />
            </div>
          )}
          {article.videoUrl && !article.videoFile && (
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#475569' }}>Lien vidéo actuel :</p>
              <code style={{ fontSize: '0.8rem' }}>{article.videoUrl}</code>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Changer le fichier vidéo</label>
              <input 
                type="file" 
                name="videoFile" 
                accept="video/*"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>OU Nouveau lien Vidéo</label>
              <input 
                type="url" 
                name="videoUrl" 
                defaultValue={article.videoUrl || ""}
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
            defaultValue={article.videoCaption || ''}
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
              style={{ height: '400px', marginBottom: '3rem' }}
            />
          </div>
          <input type="hidden" name="content" value={content} />
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="isPremium" 
              id="isPremium"
              defaultChecked={article.isPremium}
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
              defaultChecked={article.isAudioAvailable}
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
              defaultChecked={article.isConfidentiel}
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
              defaultChecked={article.isFeatured}
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
              defaultChecked={article.isLiveBlog}
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isLiveBlog" style={{ fontWeight: 'bold', color: '#dc2626', cursor: 'pointer' }}>
              🔴 Activer le Live Blog
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#eff6ff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📢 Repartager sur les réseaux sociaux
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
            Note: Cocher ces cases publiera à nouveau l'article sur les réseaux sélectionnés.
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
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

      </form>
    </div>
  );
}
