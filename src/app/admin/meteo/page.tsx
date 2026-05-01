import { prisma } from "@/lib/prisma";
import MeteoClient from "./MeteoClient";

export default async function MeteoPage() {
  // @ts-ignore
  const weather = await prisma.weatherReport.findFirst({
    orderBy: { date: 'desc' }
  });

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>Météo & Prévisions</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Mettez à jour les informations météorologiques affichées sur la page d'accueil.</p>
      
      <MeteoClient initialWeather={weather} />
    </div>
  );
}
