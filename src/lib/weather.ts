// src/lib/weather.ts
// Configuration pour Abidjan
const LAT = 5.30966;
const LON = -4.01266;

// Mapping des codes WMO vers des conditions et icônes
function getWeatherCondition(code: number): { condition: string; icon: string } {
  // Codes WMO: https://open-meteo.com/en/docs
  switch (code) {
    case 0: return { condition: "Ensoleillé", icon: "☀️" };
    case 1:
    case 2: return { condition: "Partiellement nuageux", icon: "⛅" };
    case 3: return { condition: "Nuageux", icon: "☁️" };
    case 45:
    case 48: return { condition: "Brouillard", icon: "🌫️" };
    case 51:
    case 53:
    case 55: return { condition: "Bruine", icon: "🌧️" };
    case 61:
    case 63:
    case 65: return { condition: "Pluie", icon: "🌧️" };
    case 71:
    case 73:
    case 75: return { condition: "Neige", icon: "❄️" };
    case 80:
    case 81:
    case 82: return { condition: "Averses", icon: "🌦️" };
    case 95:
    case 96:
    case 99: return { condition: "Orage", icon: "⛈️" };
    default: return { condition: "Inconnu", icon: "❓" };
  }
}

export async function fetchWeatherData() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=weathercode,temperature_2m_max&timezone=Africa%2FAbidjan`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Erreur de récupération météo");
  
  const data = await res.json();
  
  const current = data.current_weather;
  const currentDetails = getWeatherCondition(current.weathercode);
  
  const daily = data.daily;
  
  // Format the days
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  
  const forecasts = [];
  // daily.time[0] is today, so we take 1, 2, 3 for the next 3 days
  for (let i = 1; i <= 3; i++) {
    const date = new Date(daily.time[i]);
    const dayName = days[date.getDay()];
    const temp = Math.round(daily.temperature_2m_max[i]);
    const details = getWeatherCondition(daily.weathercode[i]);
    
    forecasts.push({
      day: dayName,
      temp,
      icon: details.icon
    });
  }

  return {
    city: "Abidjan",
    temperature: Math.round(current.temperature),
    condition: currentDetails.condition,
    icon: currentDetails.icon,
    forecast1Day: forecasts[0]?.day,
    forecast1Temp: forecasts[0]?.temp,
    forecast1Icon: forecasts[0]?.icon,
    forecast2Day: forecasts[1]?.day,
    forecast2Temp: forecasts[1]?.temp,
    forecast2Icon: forecasts[1]?.icon,
    forecast3Day: forecasts[2]?.day,
    forecast3Temp: forecasts[2]?.temp,
    forecast3Icon: forecasts[2]?.icon,
  };
}
