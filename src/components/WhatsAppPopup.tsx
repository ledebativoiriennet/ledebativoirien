"use client";

import { useState, useEffect } from "react";
import SafeImage from "./SafeImage";

export default function WhatsAppPopup() {
  const [show, setShow] = useState(false);
  const channelUrl = "https://whatsapp.com/channel/0029VbCauTA6xCSNYgDwIj1u";

  useEffect(() => {
    // Check if the user has already closed the popup in this session
    const closed = sessionStorage.getItem("ldi_whatsapp_popup_closed");
    if (!closed) {
      const timer = setTimeout(() => setShow(true), 15000); // 15 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem("ldi_whatsapp_popup_closed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "30px",
      right: "30px",
      width: "300px",
      zIndex: 9999,
      animation: "whatsappSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    }}>
      <div style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "16px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        position: "relative"
      }}>
        <button 
          onClick={close}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.4)",
            color: "white",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Fermer"
        >
          ✕
        </button>
        
        <a href={channelUrl} target="_blank" rel="noopener noreferrer" onClick={close} style={{ display: "block" }}>
          <SafeImage 
            src="/whatsapp-banner.png" 
            alt="Suivre LE DEBAT IVOIRIEN sur WhatsApp" 
            style={{ width: "100%", height: "auto", display: "block" }} 
          />
        </a>
        
        <div style={{ padding: "1.25rem", textAlign: "center" }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 900, marginBottom: "0.4rem", color: "var(--foreground)" }}>
            L'actu en direct sur WhatsApp
          </h4>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "1rem" }}>
            Rejoignez notre communauté et recevez les alertes infos.
          </p>
          <a href={channelUrl} target="_blank" rel="noopener noreferrer" onClick={close} style={{
            display: "block",
            backgroundColor: "#25D366",
            color: "white",
            padding: "0.6rem",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "0.85rem",
            textDecoration: "none",
            boxShadow: "0 4px 6px rgba(37, 211, 102, 0.2)"
          }}>
            S'abonner à la chaîne
          </a>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes whatsappSlideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
