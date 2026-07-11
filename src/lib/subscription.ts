import { prisma } from "./prisma";

/**
 * Vérifie les abonnements actifs et les marque comme "EXPIRED" s'ils ont dépassé leur date de fin.
 * Met également à jour le rôle de l'utilisateur si plus aucun abonnement n'est actif.
 */
export async function checkAndExpireSubscriptions(userId?: string) {
  const now = new Date();
  
  // 1. Trouver les abonnements expirés (endDate < now) et actifs
  const expiredSubs = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
      ...(userId ? { userId } : {})
    },
    select: {
      id: true,
      userId: true
    }
  });

  if (expiredSubs.length === 0) return;

  // 2. Mettre à jour le statut des abonnements
  await prisma.subscription.updateMany({
    where: {
      id: { in: expiredSubs.map(s => s.id) }
    },
    data: { status: 'EXPIRED' }
  });

  // 3. Mettre à jour le rôle des utilisateurs
  const userIds = Array.from(new Set(expiredSubs.map(s => s.userId)));
  
  for (const uid of userIds) {
    // Vérifier s'il reste d'autres abonnements actifs
    const activeSubs = await prisma.subscription.findMany({
      where: { userId: uid, status: 'ACTIVE', endDate: { gt: now } },
      select: { plan: true }
    });

    const user = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } });
    
    if (user && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      if (activeSubs.length === 0) {
        // Plus aucun abonnement actif -> Repasse en USER
        await prisma.user.update({
          where: { id: uid },
          data: { role: 'USER' }
        });
      } else {
        // Il reste des abonnements actifs, déterminer le meilleur rôle
        const plans = activeSubs.map(s => s.plan.toUpperCase());
        let effectiveRole = 'PREMIUM';
        if (plans.some(p => p.includes('ULTIMATE') || p.includes('ANNUEL'))) {
          effectiveRole = 'ULTIMATE';
        } else if (plans.some(p => p.includes('CONFIDENTIEL'))) {
          effectiveRole = 'CONFIDENTIEL';
        }
        
        if (user.role !== effectiveRole) {
          await prisma.user.update({
            where: { id: uid },
            data: { role: effectiveRole }
          });
        }
      }
    }
  }
}
