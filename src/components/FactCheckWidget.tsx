"use client";

import React from 'react';

interface FactCheckWidgetProps {
  verdict: "VRAI" | "FAUX" | "NUANCE" | string;
}

export default function FactCheckWidget({ verdict }: FactCheckWidgetProps) {
  let color = "#cbd5e1";
  let bg = "#f8fafc";
  let icon = "🧐";
  let text = "EN COURS D'ANALYSE";

  if (verdict === "VRAI") {
    color = "#16a34a"; // green-600
    bg = "#f0fdf4"; // green-50
    icon = "🟢";
    text = "C'EST VRAI";
  } else if (verdict === "FAUX") {
    color = "#dc2626"; // red-600
    bg = "#fef2f2"; // red-50
    icon = "🔴";
    text = "C'EST FAUX";
  } else if (verdict === "NUANCE" || verdict === "NUANCÉ") {
    color = "#ca8a04"; // yellow-600
    bg = "#fefce8"; // yellow-50
    icon = "🟡";
    text = "C'EST NUANCÉ";
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      backgroundColor: bg,
      border: `2px solid ${color}`,
      padding: '1.5rem',
      borderRadius: '12px',
      margin: '2rem 0',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{ fontSize: '3rem', lineHeight: 1 }}>{icon}</div>
      <div>
        <h3 style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          color: '#64748b',
          fontWeight: 800
        }}>
          Verdict du Débat Ivoirien
        </h3>
        <p style={{
          margin: '0.25rem 0 0 0',
          fontSize: '1.5rem',
          fontWeight: 900,
          color: color
        }}>
          {text}
        </p>
      </div>
    </div>
  );
}
