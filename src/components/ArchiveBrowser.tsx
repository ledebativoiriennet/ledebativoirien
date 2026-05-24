"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { getFilteredArticles, ArchiveFilters, ArchiveFilterOptions } from "@/app/actions/archive-actions";

// ---------- Types ----------
type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: Date | string | null;
  isPremium: boolean;
  categories: { id: string; name: string; slug: string }[];
};

type FilterOptions = ArchiveFilterOptions;

interface Props {
  initialArticles: Article[];
  initialTotal: number;
  filterOptions: FilterOptions;
  hasInitialMore: boolean;
}

// ---------- Utils ----------
function formatDate(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ---------- Component ----------
export default function ArchiveBrowser({ initialArticles, initialTotal, filterOptions, hasInitialMore }: Props) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(hasInitialMore);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [query, setQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedThematicId, setSelectedThematicId] = useState<string | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  // Derived: root categories (thematic)
  const rootCategories = filterOptions.categories.filter((c) => !c.parentId);
  // Sub-categories from selected thematic
  const subCategories = selectedThematicId
    ? filterOptions.categories.filter((c) => c.parentId === selectedThematicId)
    : filterOptions.categories.filter((c) => !!c.parentId);

  // Active filter count badge
  const activeFilters = [selectedYear, selectedThematicId, selectedCategoryId, selectedTagSlug, query].filter(Boolean).length;

  // ---- Fetch fresh results when filters change ----
  function applyFilters(overrides: Partial<ArchiveFilters> = {}) {
    const filters: ArchiveFilters = {
      query,
      year: selectedYear,
      thematicId: selectedThematicId,
      categoryId: selectedCategoryId,
      tagSlug: selectedTagSlug,
      page: 1,
      ...overrides,
    };

    startTransition(async () => {
      const result = await getFilteredArticles(filters);
      setArticles(result.articles as Article[]);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(1);
    });
  }

  // ---- Load more (infinite scroll) ----
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const result = await getFilteredArticles({
      query,
      year: selectedYear,
      thematicId: selectedThematicId,
      categoryId: selectedCategoryId,
      tagSlug: selectedTagSlug,
      page: nextPage,
    });
    setArticles((prev) => [...prev, ...(result.articles as Article[])]);
    setHasMore(result.hasMore);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, query, selectedYear, selectedThematicId, selectedCategoryId, selectedTagSlug]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isPending) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [loadMore, hasMore, isLoadingMore, isPending]);

  // ---- Handlers ----
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(draftQuery);
    applyFilters({ query: draftQuery });
  }

  function handleYearSelect(year: number | undefined) {
    setSelectedYear(year);
    applyFilters({ year });
  }

  function handleThematicSelect(id: string | undefined) {
    setSelectedThematicId(id);
    setSelectedCategoryId(undefined);
    applyFilters({ thematicId: id, categoryId: undefined });
  }

  function handleCategorySelect(id: string | undefined) {
    setSelectedCategoryId(id);
    applyFilters({ categoryId: id });
  }

  function handleTagSelect(slug: string | undefined) {
    setSelectedTagSlug(slug);
    applyFilters({ tagSlug: slug });
  }

  function clearAll() {
    setQuery("");
    setDraftQuery("");
    setSelectedYear(undefined);
    setSelectedThematicId(undefined);
    setSelectedCategoryId(undefined);
    setSelectedTagSlug(undefined);
    applyFilters({ query: "", year: undefined, thematicId: undefined, categoryId: undefined, tagSlug: undefined });
  }

  // ---- Render ----
  return (
    <div style={{ minHeight: "70vh" }}>

      {/* ===== HERO HEADER ===== */}
      <div style={{
        background: "linear-gradient(135deg, #e60000 0%, #8b0000 100%)",
        color: "white",
        padding: "3rem 0 4rem",
        marginBottom: "-2rem",
        position: "relative",
      }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "2.5rem" }}>🗂️</span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, margin: 0 }}>Archives du Journal</h1>
          </div>
          <p style={{ fontSize: "1.1rem", opacity: 0.85, margin: "0.5rem 0 1.5rem" }}>
            {total.toLocaleString("fr-FR")} articles disponibles
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", maxWidth: "640px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem", pointerEvents: "none" }}>🔍</span>
              <input
                type="text"
                placeholder="Rechercher dans les archives..."
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.75rem",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "1rem",
                  color: "var(--foreground)",
                  background: "white",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button type="submit" style={{
              padding: "0 1.5rem",
              background: "#111",
              color: "white",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: "0.95rem",
            }}>
              Rechercher
            </button>
          </form>
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "4rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "clamp(220px,23%,280px) 1fr", gap: "2rem", alignItems: "start" }}
          className="archive-layout">

          {/* ===== SIDEBAR ===== */}
          <div>
            {/* Mobile toggle */}
            <button
              className="archive-filter-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                display: "none",
                width: "100%",
                padding: "0.75rem 1rem",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius)",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "1rem",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
              <span>🎛️ Filtres {activeFilters > 0 && <span style={{ background: "#111", borderRadius: "999px", padding: "0.1rem 0.5rem", fontSize: "0.75rem", marginLeft: "0.4rem" }}>{activeFilters}</span>}</span>
              <span>{isSidebarOpen ? "▲" : "▼"}</span>
            </button>

            <div className={`archive-sidebar ${isSidebarOpen ? "open" : ""}`} style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              position: "sticky",
              top: "80px",
            }}>

              {/* Active Filters */}
              {activeFilters > 0 && (
                <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", borderBottom: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#dc2626" }}>
                    {activeFilters} filtre{activeFilters > 1 ? "s" : ""} actif{activeFilters > 1 ? "s" : ""}
                  </span>
                  <button onClick={clearAll} style={{ background: "none", border: "none", color: "#dc2626", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}>
                    Tout effacer
                  </button>
                </div>
              )}

              {/* Thématique */}
              <SidebarSection title="📌 Thématique" >
                <FilterChip label="Toutes" active={!selectedThematicId} onClick={() => handleThematicSelect(undefined)} />
                {rootCategories.map((cat) => (
                  <FilterChip key={cat.id} label={cat.name} active={selectedThematicId === cat.id} onClick={() => handleThematicSelect(cat.id)} />
                ))}
              </SidebarSection>

              {/* Catégorie */}
              {subCategories.length > 0 && (
                <SidebarSection title="🗂️ Catégorie">
                  <FilterChip label="Toutes" active={!selectedCategoryId} onClick={() => handleCategorySelect(undefined)} />
                  {subCategories.map((cat) => (
                    <FilterChip key={cat.id} label={cat.name} active={selectedCategoryId === cat.id} onClick={() => handleCategorySelect(cat.id)} />
                  ))}
                </SidebarSection>
              )}

              {/* Année */}
              <SidebarSection title="📅 Année">
                <FilterChip label="Toutes" active={!selectedYear} onClick={() => handleYearSelect(undefined)} />
                {filterOptions.years.map((y) => (
                  <FilterChip key={y} label={String(y)} active={selectedYear === y} onClick={() => handleYearSelect(y)} />
                ))}
              </SidebarSection>

              {/* Personnalisation (Tags) */}
              {filterOptions.tags.length > 0 && (
                <SidebarSection title="✨ Personnalisation">
                  <FilterChip label="Tous" active={!selectedTagSlug} onClick={() => handleTagSelect(undefined)} />
                  {filterOptions.tags.slice(0, 30).map((tag) => (
                    <FilterChip key={tag.id} label={tag.name} active={selectedTagSlug === tag.slug} onClick={() => handleTagSelect(tag.slug)} />
                  ))}
                </SidebarSection>
              )}
            </div>
          </div>

          {/* ===== ARTICLE LIST ===== */}
          <div>
            {/* Active query display */}
            {query && (
              <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ background: "#111", color: "white", borderRadius: "4px", padding: "0.15rem 0.6rem", fontSize: "0.8rem" }}>
                  🔍 &quot;{query}&quot;
                </span>
                <button onClick={() => { setDraftQuery(""); setQuery(""); applyFilters({ query: "" }); }}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.8rem" }}>✕ effacer</button>
              </div>
            )}

            {isPending ? (
              <LoadingGrid />
            ) : articles.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
                  {total.toLocaleString("fr-FR")} article{total > 1 ? "s" : ""} — page {page}
                </p>
                <div className="archive-grid">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Infinite scroll loader */}
                <div ref={loaderRef} style={{ padding: "2rem", textAlign: "center" }}>
                  {isLoadingMore ? (
                    <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>⏳ Chargement...</span>
                  ) : hasMore ? (
                    <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>↓ Faites défiler pour charger plus</span>
                  ) : (
                    <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>✅ Tous les articles chargés</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .archive-layout {
            grid-template-columns: 1fr !important;
          }
          .archive-filter-toggle {
            display: flex !important;
          }
          .archive-sidebar {
            display: none;
            position: static !important;
          }
          .archive-sidebar.open {
            display: block;
          }
        }
        .archive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .archive-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// ===== Sub-Components =====

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <div style={{
        padding: "0.6rem 1rem",
        fontWeight: 800,
        fontSize: "0.8rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        background: "var(--background)",
        color: "var(--muted)",
      }}>
        {title}
      </div>
      <div style={{ padding: "0.5rem 0.75rem 0.75rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {children}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        border: active ? "none" : "1px solid var(--border)",
        background: active ? "var(--primary)" : "var(--card-bg)",
        color: active ? "white" : "var(--foreground)",
        fontWeight: active ? 700 : 400,
        fontSize: "0.78rem",
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}>
      {label}
    </button>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.slug}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
        className="archive-card">
        {article.imageUrl && (
          <div style={{ width: "100%", height: "160px", overflow: "hidden", flexShrink: 0 }}>
            <img
              src={article.imageUrl}
              alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
            />
          </div>
        )}
        <div style={{ padding: "0.85rem", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Category + Premium badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
            {article.categories[0] && (
              <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "var(--primary)", letterSpacing: "0.04em" }}>
                {article.categories[0].name}
              </span>
            )}
            {article.isPremium && (
              <span className="premium-badge">PREMIUM</span>
            )}
          </div>

          <h3 style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            lineHeight: 1.35,
            color: "var(--foreground)",
            margin: "0 0 0.5rem",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {article.title}
          </h3>

          <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "auto" }}>
            📅 {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
      <style>{`
        .archive-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          border-color: var(--primary) !important;
        }
      `}</style>
    </Link>
  );
}

function LoadingGrid() {
  return (
    <div className="archive-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          animation: "pulse 1.5s ease-in-out infinite",
        }}>
          <div style={{ height: "160px", background: "var(--border)" }} />
          <div style={{ padding: "0.85rem" }}>
            <div style={{ height: "12px", background: "var(--border)", borderRadius: "4px", marginBottom: "0.5rem", width: "40%" }} />
            <div style={{ height: "14px", background: "var(--border)", borderRadius: "4px", marginBottom: "0.3rem" }} />
            <div style={{ height: "14px", background: "var(--border)", borderRadius: "4px", width: "75%" }} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        }
      `}</style>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "4rem 2rem",
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
    }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Aucun article trouvé</h2>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>Aucun article ne correspond à vos critères de recherche.</p>
      <button onClick={onClear} style={{
        padding: "0.6rem 1.5rem",
        background: "var(--primary)",
        color: "white",
        border: "none",
        borderRadius: "var(--radius)",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "0.9rem",
      }}>
        Réinitialiser les filtres
      </button>
    </div>
  );
}
