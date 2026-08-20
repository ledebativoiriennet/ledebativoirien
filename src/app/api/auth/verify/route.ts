import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
  }

  try {
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: email,
      }
    });

    if (!verification) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
    }

    if (verification.expires < new Date()) {
      return NextResponse.redirect(new URL('/login?error=TokenExpired', request.url));
    }

    // Update user
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() }
    });

    // Clean up token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token
        }
      }
    });

    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('Erreur vérification email:', error);
    return NextResponse.redirect(new URL('/login?error=ServerError', request.url));
  }
}
