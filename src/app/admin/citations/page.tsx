import { prisma } from "@/lib/prisma";
import CitationsClient from "./CitationsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CitationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Citations du Jour</h1>
      </div>
      <CitationsClient initialQuotes={quotes} />
    </div>
  );
}
