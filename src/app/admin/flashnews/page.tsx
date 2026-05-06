import React from "react";
import { prisma } from "@/lib/prisma";
import FlashNewsClient from "./FlashNewsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Administration - Fil Info (Le Direct)",
};

export default async function AdminFlashNewsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const flashNews = await prisma.flashNews.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "2rem", color: "#1e293b", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        Gestion du Fil Info (Le Direct)
      </h1>
      
      <p style={{ marginBottom: "2rem", color: "#64748b" }}>
        Ajoutez rapidement des dépêches, alertes et informations de dernière minute. Ces informations apparaîtront instantanément dans le bloc "En Continu" de la page d'accueil et sur la page du Direct.
      </p>

      <FlashNewsClient initialFlashNews={flashNews} />
    </div>
  );
}
