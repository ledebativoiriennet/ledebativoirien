"use client";

import { useState } from "react";
import { updateWeather, autoUpdateWeather } from "@/app/actions/meteo";

export default function MeteoClient({ initialWeather }: { initialWeather: any }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      city: formData.get("city") as string,
      temperature: parseInt(formData.get("temperature") as string, 10),
      apparentTemperature: parseInt(formData.get("apparentTemperature") as string, 10) || undefined,
      condition: formData.get("condition") as string,
      icon: formData.get("icon") as string,
      forecast1Day: formData.get("forecast1Day") as string,
      forecast1Temp: parseInt(formData.get("forecast1Temp") as string, 10),
      forecast1Icon: formData.get("forecast1Icon") as string,
      forecast2Day: formData.get("forecast2Day") as string,
      forecast2Temp: parseInt(formData.get("forecast2Temp") as string, 10),
      forecast2Icon: formData.get("forecast2Icon") as string,
      forecast3Day: formData.get("forecast3Day") as string,
      forecast3Temp: parseInt(formData.get("forecast3Temp") as string, 10),
      forecast3Icon: formData.get("forecast3Icon") as string,
    };

    const res = await updateWeather(data);
    if (res?.error) {
      alert("Erreur: " + res.error);
    } else {
      alert("Météo mise à jour !");
    }
    setLoading(false);
  }

  async function handleAutoSync() {
    setLoading(true);
    const res = await autoUpdateWeather();
    if (res?.error) {
      alert("Erreur: " + res.error);
    } else {
      alert("Météo synchronisée avec succès avec les données satellite !");
    }
    setLoading(false);
  }

  const defaultW = initialWeather || {};

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#f0fdf4', padding: '1rem', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#166534', fontWeight: 'bold' }}>Synchronisation Automatique</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>Récupère instantanément les données satellite pour Abidjan et les 3 prochains jours via Open-Meteo.</p>
        </div>
        <button type="button" onClick={handleAutoSync} disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Sync...' : '⚡ Sync Auto Maintenant'}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Aujourd'hui */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Météo Actuelle</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ville</label>
              <input type="text" name="city" defaultValue={defaultW.city || "Abidjan"} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Condition (ex: Ensoleillé, Pluie)</label>
              <input type="text" name="condition" defaultValue={defaultW.condition} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Température réelle (°C)</label>
              <input type="number" name="temperature" defaultValue={defaultW.temperature} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Température ressentie (°C)</label>
              <input type="number" name="apparentTemperature" defaultValue={defaultW.apparentTemperature} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Icône (Emoji ☀️, 🌧️, ⛅)</label>
              <input type="text" name="icon" defaultValue={defaultW.icon || "☀️"} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* Prévisions */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Prévisions (3 Jours)</h2>
          
          <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            {/* Jour 1 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#3b82f6' }}>Jour 1</label>
              <input type="text" name="forecast1Day" placeholder="Jour (ex: Ven)" defaultValue={defaultW.forecast1Day} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="text" name="forecast1Icon" placeholder="Icône (ex: ⛅)" defaultValue={defaultW.forecast1Icon} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="number" name="forecast1Temp" placeholder="Température" defaultValue={defaultW.forecast1Temp} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
            
            {/* Jour 2 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#3b82f6' }}>Jour 2</label>
              <input type="text" name="forecast2Day" placeholder="Jour (ex: Sam)" defaultValue={defaultW.forecast2Day} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="text" name="forecast2Icon" placeholder="Icône (ex: 🌧️)" defaultValue={defaultW.forecast2Icon} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="number" name="forecast2Temp" placeholder="Température" defaultValue={defaultW.forecast2Temp} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>

            {/* Jour 3 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#3b82f6' }}>Jour 3</label>
              <input type="text" name="forecast3Day" placeholder="Jour (ex: Dim)" defaultValue={defaultW.forecast3Day} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="text" name="forecast3Icon" placeholder="Icône (ex: ☀️)" defaultValue={defaultW.forecast3Icon} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="number" name="forecast3Temp" placeholder="Température" defaultValue={defaultW.forecast3Temp} required style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '1rem', backgroundColor: '#0f172a', color: 'white', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Enregistrement...' : 'Enregistrer la météo'}
        </button>

      </form>
    </div>
  );
}
