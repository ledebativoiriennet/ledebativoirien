import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import VisitorTracker from "@/components/VisitorTracker";
import { UserMenu } from "@/components/UserMenu";
import { prisma } from "@/lib/prisma";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Le Débat Ivoirien - Actualités en continu",
  description: "Portail d'informations et d'investigations. L'actualité en Côte d'Ivoire et dans le monde.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const navCategories = await prisma.category.findMany({
    take: 8,
    where: { articles: { some: {} } }
  });

  const indicators = await prisma.marketIndicator.findMany({
    orderBy: { order: 'asc' }
  });

  const getGroup = (groupName: string) => indicators.filter(i => i.group === groupName);
  const cacaoGrp = getGroup('CACAO');
  const anacardeGrp = getGroup('ANACARDE');
  const metaux1Grp = getGroup('METAUX1');
  const metaux2Grp = getGroup('METAUX2');
  const monnaiesGrp = getGroup('MONNAIES');

  const getTrendIcon = (trend: string) => {
    if (trend === 'UP') return '↑';
    if (trend === 'DOWN') return '↓';
    return '—';
  };
  const getTrendColor = (trend: string) => {
    if (trend === 'UP') return '#22c55e';
    if (trend === 'DOWN') return '#ef4444';
    return '#4b5563';
  };

  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <VisitorTracker />
        <Providers>
          <header className="header">
          <div className="container main-header">
            <a href="/" className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '50%', border: '4px solid var(--primary)', borderLeftColor: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--foreground)' }}>LDI</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.9 }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--foreground)', letterSpacing: '-0.05em' }}>LeDébat</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.02em', fontFamily: 'Impact, sans-serif' }}>IVOIRIEN</span>
              </div>
            </a>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <input type="text" placeholder="Rechercher..." className="input" style={{ width: '200px', padding: '0.5rem' }} />
               <UserMenu />
            </div>
          </div>
          {/* Mega Menu */}
          <div style={{ backgroundColor: 'var(--secondary)', color: 'white' }}>
            <div className="container">
              <nav className="nav" style={{ overflowX: 'auto', padding: '0.75rem 0', gap: '1.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <Link href="/" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Accueil</Link>
                {navCategories.map(c => (
                  <Link key={c.id} href={`/category/${c.slug}`} style={{ whiteSpace: 'nowrap' }}>{c.name.replace(/&amp;/g, '&')}</Link>
                ))}
              </nav>
            </div>
          </div>

          {/* BREAKING NEWS */}
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', height: '40px', overflow: 'hidden' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, zIndex: 1 }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'white', animation: 'pulse 2s infinite' }}></div>
                </div>
                <span style={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.5px' }}>BREAKING NEWS</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: `<marquee scrollamount="5" style="font-weight: 700; font-size: 0.9rem; width: 100%;">Côte d'Ivoire : le super sans plomb et le gasoil en hausse respectivement de 55 FCFA et 25 FCFA pour le mois de mai (Officiel)</marquee>` }} style={{ flex: 1, display: 'flex', alignItems: 'center' }} />
            </div>
          </div>
          
          {/* Indicators Strip - Abidjan.net Style */}
          <div style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
            <div className="container" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              
              {/* Block 1: Cacao */}
              {cacaoGrp.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                  <div style={{ height: '35px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ border: '1px solid #16a34a', padding: '0.1rem 0.3rem', display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.65rem', fontWeight: 900, color: '#3f2a14' }}>
                       <span style={{color: '#d97706'}}>☕</span> LE CONSEIL DU <span style={{color: '#15803d'}}>CAFÉ-CACAO</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#9ca3af', textTransform: 'uppercase', margin: '0.4rem 0 0.2rem 0' }}>{cacaoGrp[0].dateLabel}</div>
                  {cacaoGrp.map(ind => (
                    <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      {ind.label} <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value} {ind.extraText ? `${ind.extraText}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Block 2: Anacarde */}
              {anacardeGrp.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                  <div style={{ height: '35px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🥜</span>
                    <span style={{ fontWeight: 800, fontSize: '0.65rem', lineHeight: 1, color: '#166534' }}>Le Conseil du Coton<br/>et de l'Anacarde</span>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#9ca3af', textTransform: 'uppercase', margin: '0.4rem 0 0.2rem 0' }}>{anacardeGrp[0].dateLabel}</div>
                  {anacardeGrp.map(ind => (
                    <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      {ind.label} <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value} {ind.extraText ? `${ind.extraText}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Block 3: Métaux Précieux (Or, Zinc) */}
              {metaux1Grp.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                  <div style={{ height: '35px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#b45309', fontStyle: 'italic', letterSpacing: '-1px' }}>MINERAIS & OR</span>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#9ca3af', textTransform: 'uppercase', margin: '0.4rem 0 0.2rem 0' }}>{metaux1Grp[0].dateLabel}</div>
                  {metaux1Grp.map(ind => (
                    <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      {ind.label} <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value} {ind.extraText ? `${ind.extraText}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Block 4: Aluminium */}
              {metaux2Grp.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                  <div style={{ height: '35px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#475569' }}>INDUSTRIE</span>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#9ca3af', textTransform: 'uppercase', margin: '0.4rem 0 0.2rem 0' }}>{metaux2Grp[0].dateLabel}</div>
                  {metaux2Grp.map(ind => (
                    <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      {ind.label} <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value} {ind.extraText ? `${ind.extraText}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Block 5: Monnaies */}
              {monnaiesGrp.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-15px', left: 0, fontSize: '0.5rem', color: '#cbd5e1' }}>DEVISES</div>
                  <div style={{ height: '35px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#1e3a8a', fontStyle: 'italic' }}>FOREX CI</span>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: '#9ca3af', textTransform: 'uppercase', margin: '0.4rem 0 0.2rem 0' }}>{monnaiesGrp[0].dateLabel}</div>
                  {monnaiesGrp.map(ind => (
                    <div key={ind.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      {ind.label} <span style={{ color: getTrendColor(ind.trend), fontWeight: 400 }}>{getTrendIcon(ind.trend)} {ind.value} {ind.extraText ? `${ind.extraText}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </header>
        
        <main className="container" style={{ minHeight: '60vh' }}>
          {children}
        </main>

        <footer style={{ backgroundColor: 'var(--foreground)', color: 'white', marginTop: '4rem', paddingTop: '4rem', paddingBottom: '2rem' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--primary)', borderLeftColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>LDI</div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.9 }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>LeDébat</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.02em', fontFamily: 'Impact, sans-serif' }}>IVOIRIEN</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Parce qu'on a tous le droit de penser. Le Débat Ivoirien est votre portail d'information et d'investigation en continu.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Rubriques</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navCategories.slice(0,5).map(c => <li key={c.id}><Link href={`/category/${c.slug}`}>{c.name.replace(/&amp;/g, '&')}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Services</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><Link href="/abonnement">Abonnement Premium</Link></li>
                <li><Link href="/annonceurs">Espace Annonceurs</Link></li>
                <li><Link href="#">Archives</Link></li>
                <li><Link href="#">Newsletter</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary)' }}>Contact</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Abidjan, Côte d'Ivoire</li>
                <li>redaction@ledebativoirien.net</li>
                <li>+225 00 00 00 00 00</li>
              </ul>
            </div>
          </div>
          <div className="container" style={{ borderTop: '1px solid #334155', paddingTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            &copy; {new Date().getFullYear()} Le Débat Ivoirien. Tous droits réservés.
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
