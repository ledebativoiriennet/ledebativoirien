import { prisma } from "@/lib/prisma";
import ReseauxClient from "./ReseauxClient";

export default async function ReseauxPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "global" }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>🔗 Réseaux Sociaux</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Configurez les liens vers vos réseaux sociaux officiels pour vos lecteurs.
      </p>
      
      <ReseauxClient settings={settings} />
    </div>
  );
}
