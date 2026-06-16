"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type Argument = {
  id: string;
  content: string;
  type: string;
  votes: number;
  user: { name: string | null };
};

type DebateProps = {
  id: string;
  question: string;
  arguments: Argument[];
};

export default function ArticleDebateWidget({ debate }: { debate: DebateProps }) {
  const { data: session } = useSession();
  const [args, setArgs] = useState<Argument[]>(debate.arguments);
  const [newArg, setNewArg] = useState("");
  const [newArgType, setNewArgType] = useState<"AGREE" | "DISAGREE">("AGREE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedArgs, setVotedArgs] = useState<Set<string>>(new Set());

  const agreeArgs = args.filter(a => a.type === "AGREE").sort((a, b) => b.votes - a.votes);
  const disagreeArgs = args.filter(a => a.type === "DISAGREE").sort((a, b) => b.votes - a.votes);

  const handleVote = async (argId: string) => {
    if (!session) return alert("Vous devez être connecté pour voter.");
    if (votedArgs.has(argId)) return;

    // Optimistic UI update
    setArgs(current => current.map(a => a.id === argId ? { ...a, votes: a.votes + 1 } : a));
    setVotedArgs(new Set(votedArgs).add(argId));

    try {
      await fetch("/api/debate/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ argumentId: argId })
      });
    } catch (e) {
      console.error(e);
      // Revert if error
      setArgs(current => current.map(a => a.id === argId ? { ...a, votes: a.votes - 1 } : a));
      const newSet = new Set(votedArgs);
      newSet.delete(argId);
      setVotedArgs(newSet);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Vous devez être connecté pour débattre.");
    if (!newArg.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/debate/argument", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debateId: debate.id, content: newArg, type: newArgType })
      });
      if (res.ok) {
        const addedArg = await res.json();
        setArgs(prev => [...prev, addedArg]);
        setNewArg("");
      } else {
        alert("Erreur lors de la soumission de votre argument.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ margin: "4rem 0", padding: "2rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)" }}>Le Grand Débat</span>
        <h3 style={{ fontSize: "1.8rem", fontWeight: 900, marginTop: "0.5rem" }}>{debate.question}</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        {/* Colonne AGREE */}
        <div style={{ borderTop: "4px solid #22c55e", paddingTop: "1rem" }}>
          <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#166534", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between" }}>
            <span>✅ D'accord</span>
            <span style={{ fontSize: "0.9rem", backgroundColor: "#dcfce7", padding: "0.2rem 0.6rem", borderRadius: "12px" }}>{agreeArgs.length}</span>
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {agreeArgs.map(a => (
              <div key={a.id} style={{ padding: "1rem", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", lineHeight: 1.5 }}>"{a.content}"</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                  <span style={{ fontWeight: "bold", color: "var(--muted)" }}>— {a.user?.name || "Lecteur"}</span>
                  <button onClick={() => handleVote(a.id)} disabled={votedArgs.has(a.id)} style={{ background: "none", border: "none", cursor: votedArgs.has(a.id) ? "default" : "pointer", color: votedArgs.has(a.id) ? "#166534" : "var(--muted)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {votedArgs.has(a.id) ? "👍" : "🤍"} {a.votes}
                  </button>
                </div>
              </div>
            ))}
            {agreeArgs.length === 0 && <p style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "0.9rem" }}>Soyez le premier à donner un argument pour.</p>}
          </div>
        </div>

        {/* Colonne DISAGREE */}
        <div style={{ borderTop: "4px solid #ef4444", paddingTop: "1rem" }}>
          <h4 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#991b1b", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between" }}>
            <span>❌ Pas d'accord</span>
            <span style={{ fontSize: "0.9rem", backgroundColor: "#fee2e2", padding: "0.2rem 0.6rem", borderRadius: "12px" }}>{disagreeArgs.length}</span>
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {disagreeArgs.map(a => (
              <div key={a.id} style={{ padding: "1rem", backgroundColor: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <p style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", lineHeight: 1.5 }}>"{a.content}"</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                  <span style={{ fontWeight: "bold", color: "var(--muted)" }}>— {a.user?.name || "Lecteur"}</span>
                  <button onClick={() => handleVote(a.id)} disabled={votedArgs.has(a.id)} style={{ background: "none", border: "none", cursor: votedArgs.has(a.id) ? "default" : "pointer", color: votedArgs.has(a.id) ? "#991b1b" : "var(--muted)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {votedArgs.has(a.id) ? "👍" : "🤍"} {a.votes}
                  </button>
                </div>
              </div>
            ))}
            {disagreeArgs.length === 0 && <p style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "0.9rem" }}>Soyez le premier à donner un argument contre.</p>}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div style={{ marginTop: "3rem", padding: "1.5rem", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px dashed var(--border)" }}>
        <h4 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "bold" }}>Prenez part au débat</h4>
        {session ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "bold", color: "#166534" }}>
                <input type="radio" name="argType" checked={newArgType === "AGREE"} onChange={() => setNewArgType("AGREE")} />
                Je suis d'accord
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "bold", color: "#991b1b" }}>
                <input type="radio" name="argType" checked={newArgType === "DISAGREE"} onChange={() => setNewArgType("DISAGREE")} />
                Je ne suis pas d'accord
              </label>
            </div>
            <textarea 
              value={newArg}
              onChange={e => setNewArg(e.target.value)}
              placeholder="Écrivez votre argument le plus convaincant..."
              style={{ width: "100%", minHeight: "100px", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "1rem", fontFamily: "inherit", resize: "vertical" }}
              required
            />
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Publication..." : "Publier mon argument"}
            </button>
          </form>
        ) : (
          <p style={{ color: "var(--muted)", margin: 0 }}>Veuillez vous connecter pour publier un argument dans ce débat.</p>
        )}
      </div>
    </div>
  );
}
