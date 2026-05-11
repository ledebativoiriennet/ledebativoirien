import { prisma } from "@/lib/prisma";
import ReseauxClient from "./ReseauxClient";

export default async function ReseauxPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "global" }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '2rem' }}>⚙️ Configuration du Site</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Gérez les liens de vos réseaux sociaux et injectez du code personnalisé (scripts, tracking, widgets) dans le header et le footer.
      </p>
      
      <ReseauxClient settings={settings} />
    </div>
  );
}
