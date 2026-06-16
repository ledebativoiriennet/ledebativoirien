"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type Option = {
  id: string;
  text: string;
  votes: number;
};

type PollProps = {
  id: string;
  question: string;
  options: Option[];
};

export default function ArticlePollWidget({ poll }: { poll: PollProps }) {
  const { data: session } = useSession();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [localOptions, setLocalOptions] = useState<Option[]>(poll.options);

  const handleVote = async () => {
    if (!selectedOption) return;
    if (!session) {
      alert("Veuillez vous connecter pour voter.");
      return;
    }

    try {
      // In a real scenario, call an API like POST /api/polls/vote
      // For now, optimistic UI
      const updatedOptions = localOptions.map(o => 
        o.id === selectedOption ? { ...o, votes: o.votes + 1 } : o
      );
      setLocalOptions(updatedOptions);
      setHasVoted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const totalVotes = localOptions.reduce((sum, opt) => sum + opt.votes, 0) || 1;

  return (
    <div style={{
      margin: "3rem 0",
      padding: "2rem",
      backgroundColor: "#f8fafc",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem", color: "var(--foreground)" }}>
        📊 Votre avis nous intéresse : {poll.question}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px", margin: "0 auto" }}>
        {localOptions.map((option) => {
          const percentage = Math.round((option.votes / totalVotes) * 100);
          return (
            <div key={option.id} style={{ position: "relative" }}>
              <button
                onClick={() => !hasVoted && setSelectedOption(option.id)}
                disabled={hasVoted}
                style={{
                  width: "100%",
                  padding: "1rem",
                  textAlign: "left",
                  backgroundColor: hasVoted ? "transparent" : (selectedOption === option.id ? "#e0f2fe" : "white"),
                  border: `2px solid ${selectedOption === option.id || hasVoted ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "8px",
                  cursor: hasVoted ? "default" : "pointer",
                  position: "relative",
                  overflow: "hidden",
                  zIndex: 2,
                  transition: "all 0.2s ease"
                }}
              >
                {hasVoted && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${percentage}%`,
                    backgroundColor: "#fee2e2",
                    zIndex: -1,
                    transition: "width 1s ease-out"
                  }} />
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: selectedOption === option.id ? "bold" : "normal" }}>
                  <span>{option.text}</span>
                  {hasVoted && <span>{percentage}%</span>}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {!hasVoted && (
        <button 
          onClick={handleVote}
          disabled={!selectedOption}
          className="btn btn-primary"
          style={{ marginTop: "1.5rem", width: "100%", maxWidth: "400px", opacity: !selectedOption ? 0.5 : 1 }}
        >
          Voter
        </button>
      )}
      {hasVoted && (
        <p style={{ marginTop: "1rem", color: "var(--primary)", fontWeight: "bold", fontSize: "0.9rem" }}>
          Merci pour votre participation !
        </p>
      )}
    </div>
  );
}
