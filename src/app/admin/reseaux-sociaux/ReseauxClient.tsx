"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettings } from "@/app/actions/content";

export default function ReseauxClient({ settings }: { settings: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const facebookUrl = formData.get("facebookUrl") as string;

    const res = await updateSiteSettings(facebookUrl);
    if (res.success) {
      alert("Paramètres enregistrés !");
      router.refresh();
    } else {
      alert("Erreur lors de l'enregistrement.");
    }
    setLoading(false);
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1877F2' }}>
            Lien de la page Facebook
          </label>
          <input 
            name="facebookUrl" 
            type="url" 
            defaultValue={settings?.facebookUrl || ""}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
            placeholder="Ex: https://facebook.com/ledebativoirien" 
          />
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Ce lien sera utilisé dans le widget "Rejoignez-nous sur Facebook" de la page d'accueil.</p>
        </div>
        
        <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', backgroundColor: '#1877F2', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? "..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
