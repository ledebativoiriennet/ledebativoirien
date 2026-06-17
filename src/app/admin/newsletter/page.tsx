import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import GenerateNewsletterButton from "@/components/admin/GenerateNewsletterButton";

export default async function NewsletterAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [subscribers, logs] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    // @ts-ignore
    prisma.newsletterLog.findMany({
      take: 30,
      orderBy: { sentAt: 'desc' }
    })
  ]);

  // Statistics calculations
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.isActive).length;
  const inactiveSubscribers = totalSubscribers - activeSubscribers;
  
  // Total emails successfully sent from logs
  const totalEmailsSent = logs
    .filter((log: any) => log.status === "SUCCESS")
    .reduce((sum: number, log: any) => sum + log.recipientCount, 0);

  const getCampaignBadgeColor = (type: string) => {
    switch (type) {
      case "DAILY": return { bg: "#e0f2fe", text: "#0369a1" }; // Light blue
      case "WEEKLY": return { bg: "#f3e8ff", text: "#6b21a8" }; // Light purple
      case "MONTHLY": return { bg: "#fef3c7", text: "#b45309" }; // Light orange/yellow
      default: return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const getCampaignNameFr = (type: string) => {
    switch (type) {
      case "DAILY": return "Quotidienne";
      case "WEEKLY": return "Hebdomadaire";
      case "MONTHLY": return "Mensuelle";
      default: return type;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            📊 Activité de la Newsletter
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Suivez les inscriptions et l'historique des campagnes d'envoi automatique.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Abonnés Actifs</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{activeSubscribers}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Reçoivent les actualités en continu</div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Désinscriptions</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{inactiveSubscribers}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Personnes désabonnées</div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Campagnes Envoyées</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{logs.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Tâches CRON exécutées avec succès</div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Volume d'e-mails</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{totalEmailsSent.toLocaleString('fr-FR')}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Total cumulé des e-mails expédiés</div>
        </div>
      </div>

      <GenerateNewsletterButton />

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Section 1: Journal d'activité (Logs) */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📋</span> Historique des Envois Automatiques
          </h2>
          
          {logs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '2rem' }}>📭</span>
              <p style={{ color: '#64748b', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Aucun envoi n'a encore été enregistré. Ils apparaîtront dès le prochain déclenchement CRON.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Sujet de l'e-mail</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Destinataires</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date d'envoi</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => {
                    const badge = getCampaignBadgeColor(log.campaignType);
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {getCampaignNameFr(log.campaignType)}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 600, color: '#334155' }}>
                          {log.subject}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>
                          {log.recipientCount}
                        </td>
                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
                          {new Date(log.sentAt).toLocaleString('fr-FR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {log.status === "SUCCESS" ? (
                            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                              RÉUSSI
                            </span>
                          ) : (
                            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content' }}>
                                ÉCHOUÉ
                              </span>
                              {log.errorMessage && (
                                <span style={{ fontSize: '0.7rem', color: '#ef4444', maxWidth: '200px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={log.errorMessage}>
                                  ⚠ {log.errorMessage}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Liste des abonnés */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👥</span> Liste des Inscrits
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Adresse Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date d'inscription</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(sub => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {sub.email}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                      {new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {sub.isActive ? (
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Actif</span>
                      ) : (
                        <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>Désabonné</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Information Box */}
      <div style={{ marginTop: '2.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>ℹ️</span> Fonctionnement des envois
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
          Les newsletters sont expédiées automatiquement par des requêtes sécurisées à l'aide de tâches planifiées (CRON) :
        </p>
        <ul style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.8, paddingLeft: '1.5rem', marginTop: '0.75rem', marginBottom: 0 }}>
          <li><strong>Quotidienne</strong> (chaque soir à 20h00) : Envoi du résumé des articles de la journée via <code>/api/cron/newsletter</code>.</li>
          <li><strong>Hebdomadaire</strong> (chaque fin de semaine) : Sélection des 5 articles les plus lus de la semaine passée via <code>/api/cron/weekly-digest</code>.</li>
          <li><strong>Mensuelle</strong> (chaque fin de mois) : Sélection des meilleurs articles semaine par semaine via <code>/api/cron/monthly-digest</code>.</li>
        </ul>
      </div>
    </div>
  );
}
