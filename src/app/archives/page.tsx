import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getArchiveFilterOptions, getFilteredArticles } from "@/app/actions/archive-actions";
import ArchiveBrowser from "@/components/ArchiveBrowser";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Archives - Le Débat Ivoirien",
  description: "Consultez et recherchez tous les articles publiés sur Le Débat Ivoirien, classés par thématique, catégorie et année.",
};

const PREMIUM_ROLES = new Set(["PREMIUM", "CONFIDENTIEL", "ULTIMATE", "EDITOR", "ADMIN"]);

export default async function ArchivesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  const hasPremiumAccess = role && PREMIUM_ROLES.has(role);

  if (!hasPremiumAccess) {
    return <ArchivesPaywall isLoggedIn={!!session} />;
  }

  const [filterOptions, initialData] = await Promise.all([
    getArchiveFilterOptions(),
    getFilteredArticles({ page: 1 }),
  ]);

  return (
    <ArchiveBrowser
      initialArticles={initialData.articles as any}
      initialTotal={initialData.total}
      hasInitialMore={initialData.hasMore}
      filterOptions={filterOptions}
    />
  );
}

// ---------- Paywall Component ----------
function ArchivesPaywall({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column" }}>
      {/* Blurred preview strip */}
      <div style={{
        background: "linear-gradient(135deg, #e60000 0%, #8b0000 100%)",
        color: "white",
        padding: "3rem 0 2rem",
        textAlign: "center",
      }}>
        <div className="container">
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🗂️</div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, margin: "0 0 0.5rem" }}>
            Archives du Journal
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.8, margin: 0 }}>
            Des milliers d&apos;articles classés par thématique, catégorie et année
          </p>
        </div>
      </div>

      {/* Preview ghost cards (decoration) */}
      <div className="container" style={{ padding: "2rem 1rem 0", position: "relative" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
          filter: "blur(4px)",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.4,
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              height: "220px",
            }}>
              <div style={{ height: "140px", background: i % 2 === 0 ? "#e2e8f0" : "#cbd5e1" }} />
              <div style={{ padding: "0.75rem" }}>
                <div style={{ height: "12px", background: "#e2e8f0", borderRadius: "4px", marginBottom: "0.5rem", width: "40%" }} />
                <div style={{ height: "14px", background: "#e2e8f0", borderRadius: "4px", width: "90%" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Gradient overlay + CTA card */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 20%, var(--background) 70%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: "0",
        }}>
        </div>
      </div>

      {/* CTA Card */}
      <div className="container" style={{ paddingBottom: "4rem" }}>
        <div style={{
          maxWidth: "540px",
          margin: "0 auto",
          background: "var(--card-bg)",
          border: "2px solid var(--primary)",
          borderRadius: "var(--radius)",
          padding: "2.5rem",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(230,0,0,0.12)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: "0.75rem", color: "var(--foreground)" }}>
            Accès Réservé aux Abonnés Premium
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.65, marginBottom: "2rem" }}>
            Les archives du <strong>Débat Ivoirien</strong> donnent accès à l&apos;intégralité de nos articles classés par thématique, catégorie et année. Ce service est réservé à nos abonnés Premium.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
            <Link href="/abonnement" style={{
              display: "block",
              width: "100%",
              maxWidth: "320px",
              padding: "1rem 2rem",
              background: "var(--primary)",
              color: "white",
              borderRadius: "var(--radius)",
              fontWeight: 800,
              fontSize: "1.05rem",
              textAlign: "center",
              textDecoration: "none",
              transition: "background 0.2s",
            }}>
              🚀 S&apos;abonner au Premium
            </Link>

            {isLoggedIn ? (
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                Votre abonnement actuel ne donne pas accès aux archives.{" "}
                <Link href="/abonnement" style={{ color: "var(--primary)", fontWeight: 700 }}>
                  Mettre à niveau
                </Link>
              </p>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                Déjà abonné ?{" "}
                <Link href="/login?callbackUrl=/archives" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>
                  Connectez-vous
                </Link>
              </p>
            )}
          </div>

          {/* Benefits list */}
          <div style={{ marginTop: "2rem", textAlign: "left", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
            <p style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
              Inclus dans l&apos;abonnement Premium
            </p>
            {[
              "Accès aux archives complètes",
              "Filtrage par thématique, année et catégorie",
              "Recherche avancée dans tous les articles",
              "Articles exclusifs et enquêtes Premium",
            ].map((benefit) => (
              <div key={benefit} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                <span style={{ color: "#16a34a", fontWeight: 700 }}>✓</span>
                <span style={{ color: "var(--foreground)" }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
