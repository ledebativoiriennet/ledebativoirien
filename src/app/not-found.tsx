import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#0f172a',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: '600px', 
        height: '600px', 
        background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <div style={{ maxWidth: '800px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '3rem' }}>
          <img 
            src="/404-premium.png" 
            alt="Erreur 404" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              height: 'auto', 
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))',
              animation: 'float 6s ease-in-out infinite'
            }} 
          />
        </div>

        <h2 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
          fontWeight: 900, 
          marginBottom: '1.5rem', 
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          L'information s'est <span style={{ color: '#dc2626' }}>égarée</span>.
        </h2>
        
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#94a3b8', 
          marginBottom: '3rem', 
          lineHeight: 1.6,
          maxWidth: '600px',
          margin: '0 auto 3rem auto'
        }}>
          La page que vous recherchez n'existe pas ou a été déplacée. 
          Le débat continue sur nos autres rubriques.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ 
            backgroundColor: '#dc2626', 
            color: 'white', 
            padding: '1rem 2.5rem', 
            borderRadius: '12px', 
            fontWeight: 900, 
            textDecoration: 'none',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 10px 20px rgba(220, 38, 38, 0.3)',
            transition: 'all 0.3s ease'
          }} className="hover-premium">
            Retour à l'essentiel
          </Link>
          
          <Link href="/search" style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            color: 'white', 
            padding: '1rem 2.5rem', 
            borderRadius: '12px', 
            fontWeight: 900, 
            textDecoration: 'none',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }} className="hover-blur">
            Rechercher
          </Link>
        </div>

        <div style={{ marginTop: '5rem', display: 'flex', gap: '2rem', justifyContent: 'center', opacity: 0.5, fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          <Link href="/category/actualite" style={{ color: 'white', textDecoration: 'none' }}>Actualité</Link>
          <Link href="/category/politique" style={{ color: 'white', textDecoration: 'none' }}>Politique</Link>
          <Link href="/marketplace" style={{ color: 'white', textDecoration: 'none' }}>Kiosque</Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .hover-premium:hover {
          background-color: #ef4444;
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(220, 38, 38, 0.4);
        }
        .hover-blur:hover {
          background-color: rgba(255,255,255,0.1);
          transform: translateY(-3px);
        }
      `}} />
    </div>
  );
}
