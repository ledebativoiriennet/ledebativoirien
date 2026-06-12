import { prisma } from "./prisma";

// Dictionary to map common football teams / 3-letter abbreviations to 2-letter FlagCDN ISO codes
const countryToIso: Record<string, string> = {
  // Major World Cup & international teams
  "argentina": "ar", "arg": "ar",
  "australia": "au", "aus": "au",
  "austria": "at", "aut": "at",
  "belgium": "be", "bel": "be",
  "brazil": "br", "bra": "br",
  "cameroon": "cm", "cmr": "cm",
  "canada": "ca", "can": "ca",
  "chile": "cl", "chi": "cl",
  "colombia": "co", "col": "co",
  "costa rica": "cr", "crc": "cr",
  "croatia": "hr", "cro": "hr",
  "czechia": "cz", "cze": "cz", "czech republic": "cz",
  "denmark": "dk", "den": "dk",
  "ecuador": "ec", "ecu": "ec",
  "egypt": "eg", "egy": "eg",
  "england": "gb-eng", "eng": "gb-eng",
  "france": "fr", "fra": "fr",
  "germany": "de", "ger": "de",
  "ghana": "gh", "gha": "gh",
  "greece": "gr", "gre": "gr",
  "hungary": "hu", "hun": "hu",
  "iran": "ir", "irn": "ir",
  "italy": "it", "ita": "it",
  "japan": "jp", "jpn": "jp",
  "mexico": "mx", "mex": "mx",
  "morocco": "ma", "mar": "ma",
  "netherlands": "nl", "ned": "nl",
  "new zealand": "nz", "nzl": "nz",
  "nigeria": "ng", "nga": "ng",
  "cote d'ivoire": "ci", "civ": "ci", "ivory coast": "ci", "côte d'ivoire": "ci",
  "poland": "pl", "pol": "pl",
  "portugal": "pt", "por": "pt",
  "qatar": "qa", "qat": "qa",
  "romania": "ro", "rou": "ro",
  "saudi arabia": "sa", "ksa": "sa", "sau": "sa",
  "scotland": "gb-sct", "sco": "gb-sct",
  "senegal": "sn", "sen": "sn",
  "serbia": "rs", "srb": "rs",
  "slovakia": "sk", "svk": "sk",
  "slovenia": "si", "svn": "si",
  "south africa": "za", "rsa": "za",
  "south korea": "kr", "kor": "kr", "korea": "kr",
  "spain": "es", "esp": "es",
  "sweden": "se", "swe": "se",
  "switzerland": "ch", "sui": "ch",
  "tunisia": "tn", "tun": "tn",
  "turkey": "tr", "tur": "tr",
  "ukraine": "ua", "ukr": "ua",
  "united states": "us", "usa": "us", "usa.1": "us",
  "uruguay": "uy", "uru": "uy",
  "wales": "gb-wls", "wal": "gb-wls",
  "algeria": "dz", "alg": "dz",
  "venezuela": "ve", "ven": "ve",
  "peru": "pe", "per": "pe",
};

function getIsoCode(teamName: string, abbrev: string): string {
  const nameLower = teamName.toLowerCase().trim();
  const abbrevLower = abbrev.toLowerCase().trim();
  
  if (countryToIso[abbrevLower]) return countryToIso[abbrevLower].toUpperCase();
  if (countryToIso[nameLower]) return countryToIso[nameLower].toUpperCase();
  
  // If abbreviation is already 2 letters, it's likely a valid ISO country code
  if (abbrev.length === 2) return abbrev.toUpperCase();
  
  // Fuzzy match: check if key is in name
  for (const [key, val] of Object.entries(countryToIso)) {
    if (key.length <= 4) {
      const regex = new RegExp(`\\b${key}\\b`, "i");
      if (regex.test(nameLower) || regex.test(abbrevLower)) {
        return val.toUpperCase();
      }
    } else {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return val.toUpperCase();
      }
    }
  }
  
  return abbrev.toUpperCase(); // Fallback to abbreviation itself
}

export async function getMatchesAndSync() {
  try {
    // 1. Fetch live scoreboard from ESPN (revalidated every 60 seconds)
    const espnRes = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard", {
      next: { revalidate: 60 },
      cache: "no-store",
    });

    if (espnRes.ok) {
      const data = await espnRes.json();
      const events = data.events || [];

      for (const event of events) {
        const competition = event.competitions?.[0];
        if (!competition) continue;

        const competitors = competition.competitors || [];
        const homeCompetitor = competitors.find((c: any) => c.homeAway === "home");
        const awayCompetitor = competitors.find((c: any) => c.homeAway === "away");

        if (!homeCompetitor || !awayCompetitor) continue;

        const team1 = homeCompetitor.team?.displayName || "Home Team";
        const team2 = awayCompetitor.team?.displayName || "Away Team";

        const team1Flag = getIsoCode(team1, homeCompetitor.team?.abbreviation || "");
        const team2Flag = getIsoCode(team2, awayCompetitor.team?.abbreviation || "");

        const matchDate = new Date(event.date);

        // Determine match status mapping
        const espnState = competition.status?.type?.state; // 'pre', 'in', 'post'
        let status = "UPCOMING";
        if (espnState === "in") {
          status = "LIVE";
        } else if (espnState === "post") {
          status = "FINISHED";
        }

        // Determine score mapping
        let score = "VS";
        if (status === "LIVE" || status === "FINISHED") {
          const score1 = homeCompetitor.score || "0";
          const score2 = awayCompetitor.score || "0";
          score = `${score1} - ${score2}`;
        }

        const phase = competition.notes?.[0]?.headline || data.leagues?.[0]?.name || "Coupe du Monde";

        // Find match in DB
        const windowStart = new Date(matchDate.getTime() - 2 * 60 * 60 * 1000);
        const windowEnd = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);

        const existing = await prisma.footballMatch.findFirst({
          where: {
            OR: [
              { team1, team2 },
              { team1: team2, team2: team1 }
            ],
            matchDate: {
              gte: windowStart,
              lte: windowEnd
            }
          }
        });

        if (existing) {
          // Check if changes exist before writing
          if (
            existing.status !== status ||
            existing.score !== score ||
            existing.phase !== phase ||
            existing.team1Flag !== team1Flag ||
            existing.team2Flag !== team2Flag ||
            existing.team1 !== team1 ||
            existing.team2 !== team2
          ) {
            await prisma.footballMatch.update({
              where: { id: existing.id },
              data: {
                score,
                status,
                phase,
                matchDate,
                team1Flag,
                team2Flag,
                team1,
                team2
              }
            });
          }
        } else {
          // Create new
          await prisma.footballMatch.create({
            data: {
              team1,
              team2,
              team1Flag,
              team2Flag,
              matchDate,
              score,
              status,
              phase,
              sport: "Football",
              sportIcon: "⚽"
            }
          });
        }
      }
    }
  } catch (error) {
    console.error("[SPORTS SYNC AUTO-ERROR]:", error);
  }

  // 2. Fetch matches from database to display
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Fetch matches scheduled for today or currently LIVE
  // @ts-ignore
  let matches = await prisma.footballMatch.findMany({
    where: {
      sport: "Football",
      OR: [
        { status: "LIVE" },
        {
          matchDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      ],
    },
    orderBy: { matchDate: "asc" },
  });

  // Fallback if empty
  if (matches.length === 0) {
    // @ts-ignore
    matches = await prisma.footballMatch.findMany({
      where: {
        sport: "Football",
      },
      orderBy: { matchDate: "asc" },
      take: 10,
    });
  }

  return matches;
}
