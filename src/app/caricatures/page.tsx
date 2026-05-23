import { prisma } from "@/lib/prisma";
import SafeImage from "@/components/SafeImage";
import MainNavigation from "@/components/MainNavigation";
import SiteFooter from "@/components/SiteFooter";
import AdBanner from "@/components/AdBanner";

export default async function CaricaturesPage() {
  const items = await prisma.caricature.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <>
      <MainNavigation />
      
      <main className="container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
        <AdBanner slot="HOME_TOP" />
        
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#0f172a' }}>
            🎨 Le Dessin de Presse
          </h1>
          <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Retrouvez l'actualité ivoirienne et internationale à travers l'œil affûté de nos caricaturistes. 
            L'humour au service de l'information.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {items.map(item => (
            <article key={item.id} style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem' }}>
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} 
                />
              </div>
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Publié le {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{item.title}</h2>
              </div>
            </article>
          ))}
          
          {items.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: '#f1f5f9', borderRadius: '16px', color: '#64748b' }}>
               <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎨</span>
               Aucune caricature n'a encore été publiée. Revenez bientôt !
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
