import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '70vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center',
      padding: '4rem 2rem',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <img 
            src="/404-illustration.png" 
            alt="Page non trouvée" 
            style={{ width: '100%', maxWidth: '400px', height: 'auto', borderRadius: '20px' }} 
          />
          <h1 style={{ 
            fontSize: '8rem', 
            fontWeight: 900, 
            margin: 0, 
            lineHeight: 1, 
            opacity: 0.1, 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: -1,
            color: 'var(--primary)'
          }}>404</h1>
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--foreground)' }}>
          Oups ! Cette page est introuvable.
        </h2>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Il semble que l'article ou la page que vous recherchez ait été déplacé, supprimé ou n'ait jamais existé. 
          Ne vous inquiétez pas, vous pouvez retourner à l'essentiel.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '0.8rem 2rem', 
            borderRadius: '30px', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s'
          }} className="hover-scale">
            Retour à l'accueil
          </Link>
          
          <Link href="/search" style={{ 
            backgroundColor: 'var(--card-bg)', 
            color: 'var(--foreground)', 
            padding: '0.8rem 2rem', 
            borderRadius: '30px', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            border: '1px solid var(--border)',
            transition: 'background-color 0.2s'
          }}>
            Rechercher un article
          </Link>
        </div>

        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1rem' }}>Voici quelques rubriques populaires :</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/category/actualite" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>Actualité</Link>
            <span style={{ color: 'var(--border)' }}>•</span>
            <Link href="/category/politique" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>Politique</Link>
            <span style={{ color: 'var(--border)' }}>•</span>
            <Link href="/category/economie" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>Économie</Link>
            <span style={{ color: 'var(--border)' }}>•</span>
            <Link href="/marketplace" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>Kiosque PDF</Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-scale:hover {
          transform: translateY(-2px);
        }
      `}} />
    </div>
  );
}
