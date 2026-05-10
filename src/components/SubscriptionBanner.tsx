"use client";

import Link from "next/link";

interface Props {
  variant?: "vertical" | "horizontal";
}

export default function SubscriptionBanner({ variant = "vertical" }: Props) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      borderRadius: "16px",
      padding: "1.5rem",
      color: "white",
      position: "relative",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      marginBottom: "1.5rem"
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute",
        top: "-20px",
        right: "-20px",
        width: "100px",
        height: "100px",
        background: "rgba(230, 0, 0, 0.1)",
        borderRadius: "50%",
        filter: "blur(20px)"
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ 
          backgroundColor: "var(--primary)", 
          color: "white", 
          fontSize: "0.65rem", 
          fontWeight: 900, 
          padding: "0.2rem 0.6rem", 
          borderRadius: "4px", 
          display: "inline-block",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.75rem"
        }}>
          Soutenez l'info
        </div>
        
        <h3 style={{ 
          fontSize: "1.2rem", 
          fontWeight: 900, 
          lineHeight: 1.2, 
          marginBottom: "0.75rem",
          color: "white" 
        }}>
          L'investigation sans concession
        </h3>
        
        <p style={{ 
          fontSize: "0.85rem", 
          color: "rgba(255,255,255,0.7)", 
          marginBottom: "1.25rem",
          lineHeight: 1.4
        }}>
          Abonnez-vous pour accéder à nos exclusivités et dossiers confidentiels.
        </p>

        <Link 
          href="/abonnement" 
          style={{
            display: "block",
            backgroundColor: "white",
            color: "#0f172a",
            textAlign: "center",
            padding: "0.75rem",
            borderRadius: "8px",
            fontWeight: 800,
            fontSize: "0.9rem",
            textDecoration: "none",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--primary)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "#0f172a";
          }}
        >
          Voir les offres
        </Link>
        
        <div style={{ 
          textAlign: "center", 
          marginTop: "0.75rem", 
          fontSize: "0.7rem", 
          color: "rgba(255,255,255,0.4)",
          fontWeight: 600 
        }}>
          À partir de 200 FCFA
        </div>
      </div>
    </div>
  );
}
