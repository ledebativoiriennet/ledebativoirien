export default function WhatsAppAd() {
  const channelUrl = "https://whatsapp.com/channel/0029VbCauTA6xCSNYgDwIj1u";
  
  return (
    <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
      <a 
        href={channelUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          display: "block", 
          overflow: "hidden", 
          borderRadius: "20px", 
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          padding: "1.5rem",
          position: "relative",
          textDecoration: "none",
          boxShadow: "0 15px 30px -10px rgba(0,0,0,0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: "1px solid rgba(255,255,255,0.05)"
        }}
        className="premium-whatsapp-card"
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
             <div style={{ width: "32px", height: "32px", backgroundColor: "#25D366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
             </div>
             <span style={{ color: "white", fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em" }}>CANAL OFFICIEL</span>
          </div>
          <h3 style={{ color: "white", fontSize: "1.25rem", fontWeight: 900, lineHeight: 1.2, margin: "0 0 0.5rem 0" }}>Suivez le Débat sur WhatsApp</h3>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", margin: 0, lineHeight: 1.4 }}>Rejoignez notre communauté pour recevoir l'actualité en temps réel.</p>
          
          <div style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#25D366", fontSize: "0.9rem", fontWeight: "bold" }}>
             S'abonner maintenant →
          </div>
        </div>

        {/* Floating Logo Background */}
        <div style={{ position: "absolute", bottom: "-20px", right: "-10px", width: "120px", opacity: 0.1, transform: "rotate(-15deg)", pointerEvents: "none" }}>
           <img src="/logo.png" alt="" style={{ width: "100%", height: "auto" }} />
        </div>
      </a>
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-whatsapp-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          border-color: rgba(37, 211, 102, 0.3);
        }
      `}} />
    </div>
  );
}
