"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
    points: number;
  };
};

export default function ArticleComments({ articleId }: { articleId: string }) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?articleId=${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Erreur de chargement des commentaires:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          content: newComment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setNewComment("");
      } else {
        setMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Impossible de publier le commentaire pour le moment." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ marginTop: "2rem", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
      <h2 className="portal-section-title" style={{ backgroundColor: "#334155", borderColor: "#1e293b" }}>
        Réactions ({comments.length})
      </h2>
      
      {/* Zone de saisie */}
      <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
        {status === "loading" ? (
          <div style={{ padding: "1rem", textAlign: "center", color: "var(--muted)" }}>Chargement...</div>
        ) : session ? (
          (() => {
            const role = (session.user as any)?.role || "USER";
            const isPremium = ["PREMIUM", "CONFIDENTIEL", "ULTIMATE", "EDITOR", "ADMIN"].includes(role);
            
            if (isPremium) {
              return (
                <form onSubmit={handleSubmit}>
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Partagez votre opinion sur cet article..." 
                    style={{ width: "100%", padding: "1rem", borderRadius: "4px", border: "1px solid var(--border)", minHeight: "100px", fontFamily: "inherit", resize: "vertical" }}
                    disabled={isSubmitting}
                    required
                  />
                  {message && (
                    <div style={{ 
                      marginTop: "0.5rem", 
                      padding: "0.75rem", 
                      borderRadius: "4px", 
                      backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2", 
                      color: message.type === "success" ? "#166534" : "#991b1b",
                      fontSize: "0.9rem"
                    }}>
                      {message.text}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmitting || !newComment.trim()}
                      style={{ opacity: isSubmitting || !newComment.trim() ? 0.7 : 1 }}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Publier"}
                    </button>
                  </div>
                </form>
              );
            } else {
              return (
                <div style={{ 
                  padding: "1.5rem", 
                  backgroundColor: "#fefce8", 
                  border: "1px dashed #ca8a04", 
                  borderRadius: "4px", 
                  textAlign: "center" 
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
                  <p style={{ fontWeight: "bold", marginBottom: "0.5rem", color: "#854d0e" }}>
                    Les commentaires sont réservés à nos abonnés Premium.
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#a16207", marginBottom: "1rem" }}>
                    Abonnez-vous pour participer aux débats avec la communauté.
                  </p>
                  <Link href="/abonnement" className="btn btn-primary" style={{ display: "inline-block" }}>
                    Découvrir nos offres
                  </Link>
                </div>
              );
            }
          })()
        ) : (
          <div style={{ 
            padding: "1.5rem", 
            backgroundColor: "#f8fafc", 
            border: "1px dashed var(--border)", 
            borderRadius: "4px", 
            textAlign: "center" 
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
            <p style={{ fontWeight: "bold", marginBottom: "0.5rem", color: "var(--foreground)" }}>
              Vous devez être connecté pour laisser un commentaire.
            </p>
            <Link href="/login" className="btn btn-primary" style={{ display: "inline-block", marginTop: "0.5rem" }}>
              Se connecter
            </Link>
          </div>
        )}
      </div>

      {/* Liste des commentaires */}
      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {isLoading ? (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>Chargement des commentaires...</p>
        ) : comments.length === 0 ? (
          <p style={{ color: "var(--muted)", textAlign: "center", fontStyle: "italic" }}>
            Aucun commentaire pour l'instant. Soyez le premier à réagir !
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} style={{ display: "flex", gap: "1rem" }}>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                backgroundColor: "#e2e8f0", 
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#64748b"
              }}>
                {(comment.user.name || comment.user.email || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                  {comment.user.name || (comment.user.email ? comment.user.email.split('@')[0] : "Anonyme")}
                  {comment.user.points >= 100 ? <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }} title="Grand Débatteur">🏆</span> :
                   comment.user.points >= 50 ? <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }} title="Lecteur Fidèle">🥇</span> :
                   comment.user.points >= 10 ? <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem" }} title="Lecteur Régulier">🥈</span> : null}
                  <span style={{ fontWeight: "normal", color: "var(--muted)", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", marginTop: "0.4rem", lineHeight: 1.5, whiteSpace: "pre-wrap", color: "var(--foreground)" }}>
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
