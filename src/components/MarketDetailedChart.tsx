"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketDetailedChartProps {
  data: { date: string, value: number }[];
  color?: string;
}

export default function MarketDetailedChart({ data, color = "#2563eb" }: MarketDetailedChartProps) {
  if (!data || data.length === 0) {
    return <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)", borderRadius: "8px" }}>Pas de données historiques</div>;
  }

  const formattedData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
  }));

  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted)', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            domain={[min * 0.95, max * 1.05]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted)', fontSize: 12 }} 
            tickFormatter={(value) => value.toLocaleString("fr-FR")}
          />
          <Tooltip 
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} 
            formatter={(value: any) => [Number(value).toLocaleString("fr-FR"), "Valeur"]}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
