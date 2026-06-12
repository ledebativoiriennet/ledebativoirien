"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Match {
  id: string;
  team1: string;
  team2: string;
  team1Flag: string | null;
  team2Flag: string | null;
  matchDate: Date | string;
  phase: string | null;
  score: string | null;
  status: string;
  sport: string;
  sportIcon: string | null;
  matchTime?: string | null;
}

function getTickerFlagElement(countryCode: string | null) {
  if (!countryCode) return <span style={{ fontSize: "1rem" }}>🌍</span>;
  
  // If it's already an emoji (longer unicode character), return it
  if (/[\u0080-\uFFFF]/.test(countryCode)) {
    return <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{countryCode}</span>;
  }
  
  // If it's a 2-letter ISO code, load the flag from FlagCDN
  if (countryCode.length === 2) {
    const code = countryCode.toLowerCase();
    return (
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={countryCode}
        style={{
          width: "22px",
          height: "15px",
          objectFit: "cover",
          borderRadius: "2px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          display: "inline-block",
          verticalAlign: "middle"
        }}
      />
    );
  }
  
  return <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{countryCode}</span>;
}

export default function WorldCupTicker({ initialMatches }: { initialMatches: Match[] }) {
  const pathname = usePathname();
  const [matches, setMatches] = useState<Match[]>(initialMatches);

  // Poll for live scores updates every 30 seconds
  useEffect(() => {
    if (pathname !== "/") return;
    
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/sports/matches");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMatches(data);
          }
        }
      } catch (err) {
        console.error("Failed to update ticker scores:", err);
      }
    };

    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Only render on the homepage
  if (pathname !== "/") return null;
  if (!matches || matches.length === 0) return null;

  return (
    <div className="worldcup-ticker-container">
      <div className="worldcup-ticker-label">
        <span className="worldcup-ticker-trophy">🏆</span>
        <span className="worldcup-ticker-label-text">MONDIAL 2026</span>
      </div>
      <div className="worldcup-ticker-scroll-area">
        <div className="worldcup-ticker-wrapper">
          {/* Render matches list */}
          {matches.map((match) => {
            const matchTime = new Date(match.matchDate).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isLive = match.status === "LIVE";

            return (
              <div key={match.id} className="worldcup-match-card">
                <span className="worldcup-match-phase">{match.phase || "Match"}</span>
                <div className="worldcup-match-teams">
                  <span className="worldcup-team">
                    {getTickerFlagElement(match.team1Flag)}
                    <span className="worldcup-team-name">{match.team1}</span>
                  </span>
                  <span className="worldcup-score-badge">
                    {isLive ? (
                      <span className="worldcup-score-live">{match.score || "0-0"}</span>
                    ) : match.status === "FINISHED" ? (
                      <span className="worldcup-score-finished">{match.score || "0-0"}</span>
                    ) : (
                      <span className="worldcup-score-upcoming">{matchTime}</span>
                    )}
                  </span>
                  <span className="worldcup-team">
                    <span className="worldcup-team-name">{match.team2}</span>
                    {getTickerFlagElement(match.team2Flag)}
                  </span>
                </div>
                {isLive && (
                  <span className="worldcup-live-indicator">
                    <span className="wc-pulse-dot"></span>
                    <span className="wc-live-text">DIRECT {match.matchTime ? `• ${match.matchTime}` : ""}</span>
                  </span>
                )}
              </div>
            );
          })}

          {/* Duplicate matches list for infinite seamless marquee loop */}
          {matches.map((match) => {
            const matchTime = new Date(match.matchDate).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isLive = match.status === "LIVE";

            return (
              <div key={`${match.id}-dup`} className="worldcup-match-card">
                <span className="worldcup-match-phase">{match.phase || "Match"}</span>
                <div className="worldcup-match-teams">
                  <span className="worldcup-team">
                    {getTickerFlagElement(match.team1Flag)}
                    <span className="worldcup-team-name">{match.team1}</span>
                  </span>
                  <span className="worldcup-score-badge">
                    {isLive ? (
                      <span className="worldcup-score-live">{match.score || "0-0"}</span>
                    ) : match.status === "FINISHED" ? (
                      <span className="worldcup-score-finished">{match.score || "0-0"}</span>
                    ) : (
                      <span className="worldcup-score-upcoming">{matchTime}</span>
                    )}
                  </span>
                  <span className="worldcup-team">
                    <span className="worldcup-team-name">{match.team2}</span>
                    {getTickerFlagElement(match.team2Flag)}
                  </span>
                </div>
                {isLive && (
                  <span className="worldcup-live-indicator">
                    <span className="wc-pulse-dot"></span>
                    <span className="wc-live-text">DIRECT {match.matchTime ? `• ${match.matchTime}` : ""}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
