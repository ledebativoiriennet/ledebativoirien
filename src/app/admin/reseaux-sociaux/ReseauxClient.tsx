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
    const data = {
      facebookUrl: formData.get("facebookUrl") as string,
      twitterUrl: formData.get("twitterUrl") as string,
      instagramUrl: formData.get("instagramUrl") as string,
      linkedinUrl: formData.get("linkedinUrl") as string,
      youtubeUrl: formData.get("youtubeUrl") as string,
    };

    const res = await updateSiteSettings(data);
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
            Facebook
          </label>
          <input 
            name="facebookUrl" 
            type="url" 
            defaultValue={settings?.facebookUrl || ""}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
            placeholder="Ex: https://facebook.com/..." 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#000000' }}>
            X (Twitter)
          </label>
          <input 
            name="twitterUrl" 
            type="url" 
            defaultValue={settings?.twitterUrl || ""}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
            placeholder="Ex: https://x.com/..." 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#E1306C' }}>
            Instagram
          </label>
          <input 
            name="instagramUrl" 
            type="url" 
            defaultValue={settings?.instagramUrl || ""}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
            placeholder="Ex: https://instagram.com/..." 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0A66C2' }}>
            LinkedIn
          </label>
          <input 
            name="linkedinUrl" 
            type="url" 
            defaultValue={settings?.linkedinUrl || ""}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
            placeholder="Ex: https://linkedin.com/..." 
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#FF0000' }}>
            YouTube
          </label>
          <input 
            name="youtubeUrl" 
            type="url" 
            defaultValue={settings?.youtubeUrl || ""}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
            placeholder="Ex: https://youtube.com/..." 
          />
        </div>
        
        <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? "..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
