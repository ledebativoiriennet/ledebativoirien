"use client";

import { useState, useEffect } from "react";
import SafeImage from "./SafeImage";

export default function WhatsAppPopup() {
  const [show, setShow] = useState(false);
  const channelUrl = "https://whatsapp.com/channel/0029VbCauTA6xCSNYgDwIj1u";

  useEffect(() => {
    // Show after 5 seconds
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "30px",
      right: "30px",
      width: "320px",
      zIndex: 10000,
      animation: "whatsappPopUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
        padding: "1.5rem"
      }}>
        {/* Close Button */}
        <button 
          onClick={close}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "white",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
          className="close-hover"
        >
          ✕
        </button>
        
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
             <div style={{ width: "40px", height: "40px", backgroundColor: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(37, 211, 102, 0.4)" }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
             </div>
             <span style={{ color: "white", fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>WhatsApp News</span>
          </div>
          
          <h4 style={{ fontSize: "1.2rem", fontWeight: 900, marginBottom: "0.5rem", color: "white", lineHeight: 1.2 }}>
            Le Débat Ivoirien dans votre poche
          </h4>
          <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Recevez nos enquêtes et exclusivités directement sur votre smartphone.
          </p>
          
          <a 
            href={channelUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={close}
            style={{
              display: "block",
              backgroundColor: "#25D366",
              color: "white",
              padding: "0.8rem",
              borderRadius: "12px",
              fontWeight: 900,
              fontSize: "0.95rem",
              textDecoration: "none",
              textAlign: "center",
              boxShadow: "0 10px 15px rgba(37, 211, 102, 0.3)",
              transition: "all 0.3s"
            }}
            className="whatsapp-btn-hover"
          >
            Rejoindre la chaîne
          </a>
        </div>

        {/* Watermark Logo */}
        <div style={{ position: "absolute", top: "-20px", left: "-20px", width: "120px", opacity: 0.05, transform: "rotate(15deg)", pointerEvents: "none" }}>
           <img src="/logo.png" alt="" style={{ width: "100%", height: "auto" }} />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes whatsappPopUp {
          0% { transform: translateY(50px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .whatsapp-btn-hover:hover {
          background-color: #22c35e;
          transform: translateY(-2px);
        }
        .close-hover:hover {
          background-color: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
