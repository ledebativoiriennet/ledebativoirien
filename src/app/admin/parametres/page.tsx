import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ParametresClient from "./ParametresClient";

export default async function ParametresPage() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id as string }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem', color: '#0f172a' }}>⚙️ Paramètres</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Gérez vos informations personnelles et la sécurité de votre compte administrateur.
      </p>

      <ParametresClient user={{ id: user.id, name: user.name, email: user.email }} />
    </div>
  );
}
