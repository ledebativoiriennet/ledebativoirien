import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60; // Revalidate every minute

function getFlagElement(countryCode: string | null, size: 'small' | 'large' = 'large') {
  if (!countryCode) return <span style={{ fontSize: size === 'small' ? '1rem' : '1.5rem' }}>🌍</span>;
  
  if (/[\u0080-\uFFFF]/.test(countryCode)) {
    return <span style={{ fontSize: size === 'small' ? '1.2rem' : '1.5rem', lineHeight: 1 }}>{countryCode}</span>;
  }
  
  if (countryCode.length === 2) {
    const code = countryCode.toLowerCase();
    const width = size === 'small' ? '24px' : '40px';
    const height = size === 'small' ? '16px' : 'auto';
    const flagWidthUrl = size === 'small' ? 'w40' : 'w80';
    return (
      <img
        src={`https://flagcdn.com/${flagWidthUrl}/${code}.png`}
        alt={countryCode}
        style={{
          width,
          height,
          objectFit: "cover",
          borderRadius: "2px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          display: "inline-block",
          verticalAlign: "middle"
        }}
      />
    );
  }
  
  return <span style={{ fontSize: size === 'small' ? '0.7rem' : '1rem', fontWeight: "bold" }}>{countryCode}</span>;
}

type TeamStats = {
  name: string;
  flag: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export default async function CoupeDuMondePage() {
  // @ts-ignore
  const matches = await prisma.footballMatch.findMany({
    orderBy: { matchDate: "asc" },
  });

  // Calculate Standings
  const standings: Record<string, Record<string, TeamStats>> = {};

  // Group matches by Phase (Poule/Groupe)
  const matchesByPhase: Record<string, typeof matches> = {};

  for (const match of matches) {
    const phase = match.phase || "Autres";
    
    // Group matches
    if (!matchesByPhase[phase]) {
      matchesByPhase[phase] = [];
    }
    matchesByPhase[phase].push(match);

    // Only calculate standings for group stages (contains "group" or "poule")
    // Note: ESPN API usually sends "Group A"
    const isGroupStage = phase.toLowerCase().includes("group") || phase.toLowerCase().includes("poule");
    if (isGroupStage) {
      if (!standings[phase]) standings[phase] = {};
      
      const initTeam = (team: string, flag: string | null) => {
        if (!standings[phase][team]) {
          standings[phase][team] = { name: team, flag, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
        }
      };

      initTeam(match.team1, match.team1Flag);
      initTeam(match.team2, match.team2Flag);

      if (match.status === "FINISHED" || match.status === "LIVE") {
        const scores = match.score?.split(" - ");
        if (scores && scores.length === 2) {
          const s1 = parseInt(scores[0].trim());
          const s2 = parseInt(scores[1].trim());
          
          if (!isNaN(s1) && !isNaN(s2)) {
            standings[phase][match.team1].played += 1;
            standings[phase][match.team2].played += 1;
            
            standings[phase][match.team1].gf += s1;
            standings[phase][match.team1].ga += s2;
            standings[phase][match.team1].gd += (s1 - s2);
            
            standings[phase][match.team2].gf += s2;
            standings[phase][match.team2].ga += s1;
            standings[phase][match.team2].gd += (s2 - s1);
            
            if (s1 > s2) {
              standings[phase][match.team1].won += 1;
              standings[phase][match.team1].points += 3;
              standings[phase][match.team2].lost += 1;
            } else if (s1 < s2) {
              standings[phase][match.team2].won += 1;
              standings[phase][match.team2].points += 3;
              standings[phase][match.team1].lost += 1;
            } else {
              standings[phase][match.team1].drawn += 1;
              standings[phase][match.team1].points += 1;
              standings[phase][match.team2].drawn += 1;
              standings[phase][match.team2].points += 1;
            }
          }
        }
      }
    }
  }

  // Sort groups alphabetically (e.g. Group A, Group B)
  const groupNames = Object.keys(standings).sort();
  
  // Sort matches by Phase alphabetically as well
  const phaseNames = Object.keys(matchesByPhase).sort();

  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <div style={{ marginBottom: "2rem", borderBottom: "2px solid var(--border)", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>🏆</span>
          Coupe du Monde : Classements & Résultats
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", marginTop: "0.5rem" }}>
          Suivez l'évolution des poules et retrouvez l'intégralité des scores de la compétition.
        </p>
      </div>

      {/* CLASSEMENT DES POULES */}
      {groupNames.length > 0 && (
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "1.5rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📊</span> Classement par Poules
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem" }}>
            {groupNames.map(group => {
              const teams = Object.values(standings[group]);
              // Sort teams: Points (desc), GD (desc), GF (desc)
              teams.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.gd !== a.gd) return b.gd - a.gd;
                return b.gf - a.gf;
              });

              return (
                <div key={group} style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                  <div style={{ backgroundColor: "var(--primary)", color: "white", padding: "0.75rem 1rem", fontWeight: 900, textTransform: "uppercase", fontSize: "1rem" }}>
                    {group}
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "rgba(0,0,0,0.02)", color: "var(--muted)", textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                          <th style={{ padding: "0.75rem 1rem", fontWeight: "bold" }}>Équipe</th>
                          <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }} title="Joués">J</th>
                          <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }} title="Gagnés">G</th>
                          <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }} title="Nuls">N</th>
                          <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }} title="Perdus">P</th>
                          <th style={{ padding: "0.75rem 0.5rem", textAlign: "center" }} title="Différence de buts">Diff</th>
                          <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 900, color: "var(--foreground)" }}>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teams.map((team, idx) => (
                          <tr key={team.name} style={{ borderBottom: "1px solid var(--border)", backgroundColor: idx < 2 ? "rgba(34, 197, 94, 0.05)" : "transparent" }}>
                            <td style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--foreground)" }}>
                              <span style={{ color: "var(--muted)", fontSize: "0.75rem", width: "12px" }}>{idx + 1}</span>
                              {getFlagElement(team.flag, 'small')}
                              {team.name}
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{team.played}</td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{team.won}</td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{team.drawn}</td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>{team.lost}</td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "bold", color: team.gd > 0 ? "#16a34a" : team.gd < 0 ? "#dc2626" : "var(--muted)" }}>
                              {team.gd > 0 ? `+${team.gd}` : team.gd}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 900, color: "var(--primary)" }}>{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RÉSULTATS DES MATCHS PAR POULE */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "-1rem", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>⚽</span> Calendrier & Résultats par Poules
        </h2>
        
        {phaseNames.map(phaseStr => {
          const phaseMatches = matchesByPhase[phaseStr];
          return (
            <div key={phaseStr}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, backgroundColor: "#334155", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", display: "inline-block", marginBottom: "1.5rem", textTransform: "uppercase" }}>
                {phaseStr}
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                {phaseMatches.map(match => {
                  const matchDateStr = new Date(match.matchDate).toLocaleDateString("fr-FR", {
                    weekday: "short", day: "numeric", month: "short"
                  });
                  const matchTime = new Date(match.matchDate).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const isLive = match.status === "LIVE";
                  const isFinished = match.status === "FINISHED";

                  return (
                    <div key={match.id} style={{ 
                      backgroundColor: "var(--card-bg)", 
                      border: "1px solid var(--border)", 
                      borderRadius: "12px", 
                      padding: "1.2rem",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      {isLive && (
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", backgroundColor: "#ef4444", animation: "pulse 2s infinite" }}></div>
                      )}
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", fontSize: "0.75rem", color: "var(--muted)", fontWeight: "bold", textTransform: "uppercase" }}>
                        <span>{matchDateStr}</span>
                        {isLive ? (
                          <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", animation: "pulse 1.5s infinite" }}></span>
                            EN DIRECT {match.matchTime ? `(${match.matchTime})` : ""}
                          </span>
                        ) : isFinished ? (
                          <span>Terminé</span>
                        ) : (
                          <span>{matchTime}</span>
                        )}
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                          {getFlagElement(match.team1Flag, 'large')}
                          <span style={{ fontWeight: 800, fontSize: "0.95rem", textAlign: "center", color: "var(--foreground)" }}>{match.team1}</span>
                        </div>
                        
                        <div style={{ padding: "0 1rem", flexShrink: 0 }}>
                          {isLive || isFinished ? (
                            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: isLive ? "#ef4444" : "var(--foreground)", fontFamily: "monospace" }}>
                              {match.score}
                            </div>
                          ) : (
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--muted)", backgroundColor: "rgba(0,0,0,0.05)", padding: "0.4rem 0.8rem", borderRadius: "6px" }}>
                              VS
                            </div>
                          )}
                        </div>
                        
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                          {getFlagElement(match.team2Flag, 'large')}
                          <span style={{ fontWeight: 800, fontSize: "0.95rem", textAlign: "center", color: "var(--foreground)" }}>{match.team2}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {phaseNames.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px dashed var(--border)", color: "var(--muted)" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>⚽</span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Aucun match n'est encore programmé</h3>
            <p>Le calendrier de la compétition sera bientôt disponible.</p>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <Link href="/" style={{ display: "inline-block", backgroundColor: "var(--card-bg)", color: "var(--foreground)", border: "1px solid var(--border)", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}>
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
