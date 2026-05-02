"use client";

import { useState, useEffect } from 'react';
import { voteOnPoll } from '@/app/actions/poll';

type Option = {
  id: string;
  text: string;
  votes: number;
};

type Poll = {
  id: string;
  question: string;
  options: Option[];
};

export function PollWidget({ poll }: { poll: Poll }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    // Check if the user already voted for this specific poll
    const voted = localStorage.getItem(`ldi_poll_${poll.id}`);
    if (voted) {
      setHasVoted(true);
      setShowResults(true);
    }
  }, [poll.id]);

  const handleVote = async () => {
    if (!selectedOption) return;
    
    setIsVoting(true);
    const res = await voteOnPoll(selectedOption);
    
    if (res.success) {
      setHasVoted(true);
      setShowResults(true);
      localStorage.setItem(`ldi_poll_${poll.id}`, 'true');
    } else {
      alert("Erreur lors du vote. Veuillez réessayer.");
    }
    setIsVoting(false);
  };

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
  
  // Calculate display percentages. We add 1 local vote if the user just voted so it updates optimistically.
  // Wait, the Server Action calls revalidatePath, so Next.js might send new props down automatically!
  // But just in case, we'll rely on the latest props passed from the server.

  return (
    <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.5rem" }}>
      <h2 className="portal-section-title">Le Sondage du Jour</h2>
      <div style={{ padding: "1rem" }}>
        <p style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "1rem", color: "var(--foreground)" }}>{poll.question}</p>
        
        {!showResults ? (
          <form style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {poll.options.map(opt => (
              <label key={opt.id} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.85rem", cursor: "pointer", padding: "0.5rem", border: selectedOption === opt.id ? "1px solid var(--primary)" : "1px solid transparent", borderRadius: "4px", backgroundColor: selectedOption === opt.id ? "rgba(var(--primary-rgb), 0.1)" : "transparent", transition: "all 0.2s" }}>
                <input 
                  type="radio" 
                  name="poll" 
                  style={{ marginTop: "0.2rem" }} 
                  checked={selectedOption === opt.id}
                  onChange={() => setSelectedOption(opt.id)}
                />
                <span style={{ fontWeight: selectedOption === opt.id ? 700 : 400 }}>{opt.text}</span>
              </label>
            ))}
            <button 
              type="button" 
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className="btn btn-primary" 
              style={{ marginTop: "0.5rem", padding: "0.5rem", fontSize: "0.85rem", opacity: (!selectedOption || isVoting) ? 0.5 : 1 }}
            >
              {isVoting ? "Vote en cours..." : "Voter"}
            </button>
            <button 
              type="button" 
              onClick={() => setShowResults(true)}
              style={{ background: "none", border: "none", display: "block", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
            >
              Voir les résultats
            </button>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {poll.options.map(opt => {
              const percentage = totalVotes === 0 ? 0 : Math.round((opt.votes / totalVotes) * 100);
              return (
                <div key={opt.id} style={{ fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontWeight: 600 }}>
                    <span>{opt.text}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div style={{ width: "100%", height: "8px", backgroundColor: "var(--muted)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: "var(--primary)", transition: "width 1s ease-in-out" }}></div>
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--muted)", textAlign: "right", marginTop: "0.2rem" }}>
                    {opt.votes} vote{opt.votes > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--foreground)", textAlign: "center", fontWeight: "bold" }}>
              Total des votes : {totalVotes}
            </div>
            {!hasVoted && (
              <button 
                type="button" 
                onClick={() => setShowResults(false)}
                style={{ background: "none", border: "none", display: "block", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
              >
                Retour au vote
              </button>
            )}
            {hasVoted && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: 'bold' }}>
                ✓ A voté
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
