"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ArticlePreviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("article-preview");
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  if (!data) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1>Chargement de la prévisualisation...</h1>
        <p>Si rien ne s'affiche, assurez-vous d'avoir cliqué sur "Aperçu en direct" dans l'éditeur.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      {/* Banner */}
      <div style={{ backgroundColor: "#ef4444", color: "white", padding: "0.5rem", textAlign: "center", fontWeight: "bold", position: "sticky", top: 0, zIndex: 50 }}>
        MODE PRÉVISUALISATION - Cet article n&apos;est pas encore enregistré.
      </div>

      <nav style={{ backgroundColor: "white", padding: "1rem", borderBottom: "1px solid #e2e8f0", marginBottom: "2rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 900, color: "#ef4444" }}>LE DÉBAT IVOIRIEN</span>
          <button onClick={() => window.close()} style={{ padding: "0.5rem 1rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Fermer l&apos;aperçu
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0f172a", marginBottom: "1rem", lineHeight: 1.2 }}>
          {data.title || "Titre de l'article"}
        </h1>

        {data.excerpt && (
          <p style={{ fontSize: "1.25rem", color: "#475569", marginBottom: "2rem", lineHeight: 1.6, fontWeight: 500, borderLeft: "4px solid #ef4444", paddingLeft: "1.5rem" }}>
            {data.excerpt}
          </p>
        )}

        {data.imageUrl && (
          <div style={{ marginBottom: "2rem", borderRadius: "8px", overflow: "hidden" }}>
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.imageUrl} 
              alt="Couverture" 
              style={{ width: "100%", height: "auto", display: "block" }} 
            />
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content }} 
          style={{ lineHeight: 1.8, color: "#334155", fontSize: "1.1rem" }}
        />
        
        <style jsx global>{`
          .prose img { max-width: 100%; border-radius: 8px; margin: 2rem 0; }
          .prose h2 { font-size: 1.75rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #0f172a; }
          .prose h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #1e293b; }
          .prose p { margin-bottom: 1.5rem; }
          .prose blockquote { border-left: 4px solid #e2e8f0; padding-left: 1.5rem; font-style: italic; color: #64748b; margin: 2rem 0; }
        `}</style>
      </main>

      <footer style={{ marginTop: "4rem", padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
        &copy; 2026 Le Débat Ivoirien - Prévisualisation
      </footer>
    </div>
  );
}
