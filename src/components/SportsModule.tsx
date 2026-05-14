import { prisma } from "@/lib/prisma";

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return "🌍";
  // If it's already an emoji or not a 2-letter code, return as is
  if (countryCode.length !== 2 || /[\u0080-\uFFFF]/.test(countryCode)) return countryCode;
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default async function SportsModule() {
  // @ts-ignore
  const matches = await prisma.footballMatch.findMany({
    take: 3,
    orderBy: [
      { status: 'asc' }, // LIVE (L) before UPCOMING (U)
      { matchDate: 'asc' }
    ],
    where: {
      status: { in: ['UPCOMING', 'LIVE'] }
    }
  });

  if (!matches || matches.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#dc2626', padding: '1.5rem', marginBottom: '2rem', borderRadius: 'var(--radius)', color: 'white', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #fef08a, #f59e0b, #fbbf24)' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{matches[0]?.sportIcon || '⚽'}</span> {matches[0]?.sport || 'Mondial 2026'}
        </h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`, gap: '1.5rem' }}>
        {matches.map((match: any) => (
          <div key={match.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
            {match.status === 'LIVE' && (
              <span style={{ position: 'absolute', top: '-10px', right: '10px', backgroundColor: '#dc2626', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>EN DIRECT</span>
            )}
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {match.phase} • {new Date(match.matchDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{getFlagEmoji(match.team1Flag || "")}</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>{match.team1}</span>
              </div>
              
              <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: match.status === 'LIVE' ? '#fef08a' : 'white' }}>
                  {match.score || "VS"}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{getFlagEmoji(match.team2Flag || "")}</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>{match.team2}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
