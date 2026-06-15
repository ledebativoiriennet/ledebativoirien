"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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

function getFlagElement(countryCode: string | null) {
  if (!countryCode) return <span style={{ fontSize: "1.2rem" }}>🌍</span>;
  
  if (/[\u0080-\uFFFF]/.test(countryCode)) {
    return <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>{countryCode}</span>;
  }
  
  if (countryCode.length === 2) {
    const code = countryCode.toLowerCase();
    return (
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={countryCode}
        style={{
          width: "28px",
          height: "20px",
          objectFit: "cover",
          borderRadius: "2px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          display: "inline-block",
        }}
      />
    );
  }
  
  return <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{countryCode}</span>;
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
        console.error("Failed to update matches:", err);
      }
    };

    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Only render on the homepage
  if (pathname !== "/") return null;
  if (!matches || matches.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#0f172a', padding: '1.5rem 0', borderBottom: '1px solid #1e293b' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.1 }}>Mondial 2026</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Matchs du jour</div>
            </div>
          </div>
          
          <Link href="/sports/coupe-du-monde" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: '#dc2626', 
            color: 'white', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '4px', 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'background-color 0.2s'
          }}>
            Tous les matchs & scores →
          </Link>
        </div>

        {/* Modules Grid */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin', scrollbarColor: '#334155 #0f172a' }}>
          {matches.map(match => {
            const matchTime = new Date(match.matchDate).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isLive = match.status === "LIVE";
            const isFinished = match.status === "FINISHED";

            return (
              <div key={match.id} style={{ 
                flexShrink: 0, 
                width: '280px', 
                backgroundColor: '#1e293b', 
                borderRadius: '8px', 
                padding: '1rem',
                border: '1px solid #334155',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  <span>{match.phase || "Phase de groupes"}</span>
                  {isLive ? (
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
                      DIRECT {match.matchTime ? `(${match.matchTime})` : ""}
                    </span>
                  ) : isFinished ? (
                    <span>Terminé</span>
                  ) : (
                    <span style={{ color: '#cbd5e1' }}>{matchTime}</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '40%' }}>
                    {getFlagElement(match.team1Flag)}
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.2 }}>{match.team1}</span>
                  </div>
                  
                  <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
                    {isLive || isFinished ? (
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isLive ? '#fef08a' : 'white', fontFamily: 'monospace' }}>
                        {match.score}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#64748b' }}>VS</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '40%' }}>
                    {getFlagElement(match.team2Flag)}
                    <span style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.2 }}>{match.team2}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}
