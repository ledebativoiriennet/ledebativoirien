import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { subscriptions: { where: { status: 'ACTIVE' } } }
        });

        if (!user || !user.password) {
          throw new Error("Identifiants incorrects");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Identifiants incorrects");
        }

        // Déterminer le rôle effectif basé sur les abonnements actifs
        let effectiveRole = user.role;
        if (effectiveRole === 'USER' && user.subscriptions.length > 0) {
          const plans = user.subscriptions.map(s => s.plan.toUpperCase());
          if (plans.some(p => p.includes('ULTIMATE'))) {
            effectiveRole = 'ULTIMATE';
          } else if (plans.some(p => p.includes('CONFIDENTIEL'))) {
            effectiveRole = 'CONFIDENTIEL';
          } else {
            effectiveRole = 'PREMIUM';
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: effectiveRole,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      const { logActivity } = await import("./activity");
      await logActivity({
        action: "LOGIN",
        userId: user.id,
        userName: user.name || undefined,
        userEmail: user.email || undefined,
        details: "Connexion réussie"
      });
    }
  },
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL?.startsWith('http://'),
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "secret_local_dev_12345",
};

/**
 * Helper pour vérifier si l'utilisateur est Admin ou Éditeur.
 * À utiliser dans les Server Actions ou les API Routes.
 */
export async function checkAdminOrEditor() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    throw new Error("Non autorisé. Vous devez être Administrateur ou Éditeur.");
  }
  return session;
}

/**
 * Helper pour vérifier si l'utilisateur est Admin.
 */
export async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    throw new Error("Non autorisé. Vous devez être Administrateur.");
  }
  return session;
}
