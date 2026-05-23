"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminArticleSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset to page 1 on new search
    router.push(`/admin/articles?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', maxWidth: '500px' }}>
      <input
        type="text"
        placeholder="Rechercher par titre d'article..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input"
        style={{
          flex: 1,
        }}
      />
      <button
        type="submit"
        style={{
          padding: '0.5rem 1.5rem',
          backgroundColor: '#334155',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        Rechercher
      </button>
    </form>
  );
}
