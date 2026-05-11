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
      
      facebookPageId: formData.get("facebookPageId") as string,
      facebookAccessToken: formData.get("facebookAccessToken") as string,
      twitterApiKey: formData.get("twitterApiKey") as string,
      twitterApiSecret: formData.get("twitterApiSecret") as string,
      twitterAccessToken: formData.get("twitterAccessToken") as string,
      twitterAccessSecret: formData.get("twitterAccessSecret") as string,
      linkedinAccessToken: formData.get("linkedinAccessToken") as string,
      linkedinUrn: formData.get("linkedinUrn") as string,
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
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* FACEBOOK */}
        <div style={{ padding: '1rem', border: '1px solid #1877F2', borderRadius: '8px' }}>
          <h2 style={{ color: '#1877F2', marginTop: 0, fontSize: '1.2rem' }}>Facebook</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>URL de la Page</label>
              <input name="facebookUrl" type="url" defaultValue={settings?.facebookUrl || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: https://facebook.com/..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>ID de la Page</label>
                <input name="facebookPageId" type="text" defaultValue={settings?.facebookPageId || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Page Access Token (Long-lived)</label>
                <input name="facebookAccessToken" type="password" defaultValue={settings?.facebookAccessToken || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* X (TWITTER) */}
        <div style={{ padding: '1rem', border: '1px solid #000000', borderRadius: '8px' }}>
          <h2 style={{ color: '#000000', marginTop: 0, fontSize: '1.2rem' }}>X (Twitter)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>URL du Compte</label>
              <input name="twitterUrl" type="url" defaultValue={settings?.twitterUrl || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>API Key</label>
                <input name="twitterApiKey" type="text" defaultValue={settings?.twitterApiKey || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>API Secret</label>
                <input name="twitterApiSecret" type="password" defaultValue={settings?.twitterApiSecret || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Access Token</label>
                <input name="twitterAccessToken" type="text" defaultValue={settings?.twitterAccessToken || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Access Secret</label>
                <input name="twitterAccessSecret" type="password" defaultValue={settings?.twitterAccessSecret || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* LINKEDIN */}
        <div style={{ padding: '1rem', border: '1px solid #0A66C2', borderRadius: '8px' }}>
          <h2 style={{ color: '#0A66C2', marginTop: 0, fontSize: '1.2rem' }}>LinkedIn</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>URL du Profil/Page</label>
              <input name="linkedinUrl" type="url" defaultValue={settings?.linkedinUrl || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>Access Token</label>
                <input name="linkedinAccessToken" type="password" defaultValue={settings?.linkedinAccessToken || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>LinkedIn URN (ID)</label>
                <input name="linkedinUrn" type="text" defaultValue={settings?.linkedinUrn || ""} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ex: urn:li:organization:12345" />
              </div>
            </div>
          </div>
        </div>

        {/* OTHERS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#E1306C' }}>Instagram URL</label>
            <input name="instagramUrl" type="url" defaultValue={settings?.instagramUrl || ""} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#FF0000' }}>YouTube URL</label>
            <input name="youtubeUrl" type="url" defaultValue={settings?.youtubeUrl || ""} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>
        </div>
        
        <button type="submit" disabled={loading} style={{ alignSelf: 'flex-start', padding: '1rem 3rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
          {loading ? "Enregistrement..." : "Sauvegarder les configurations"}
        </button>
      </form>
    </div>
  );
}
