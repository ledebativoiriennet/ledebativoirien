import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CommentActions from "./CommentActions";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: [
      { isActive: 'asc' }, // Pending comments first
      { createdAt: 'desc' }
    ],
    include: {
      user: {
        select: { name: true, email: true }
      },
      article: {
        select: { title: true, slug: true }
      }
    }
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>💬 Modération des Commentaires</h1>
        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Total : {comments.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            Aucun commentaire trouvé.
          </div>
        ) : (
          comments.map(comment => (
            <div 
              key={comment.id} 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                borderLeft: comment.isActive ? '4px solid #10b981' : '4px solid #f59e0b',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#0f172a' }}>
                      {comment.user.name || comment.user.email}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '0.1rem 0.4rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!comment.isActive && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b45309', backgroundColor: '#fef3c7', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>
                        En attente
                      </span>
                    )}
                  </div>
                  
                  <p style={{ margin: '0.75rem 0', fontSize: '0.95rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </p>

                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Sur l'article : {' '}
                    <Link href={`/article/${comment.article.slug}`} target="_blank" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
                      {comment.article.title} ↗
                    </Link>
                  </div>
                </div>

                {/* Boutons d'action (Client Component) */}
                <CommentActions commentId={comment.id} isActive={comment.isActive} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
