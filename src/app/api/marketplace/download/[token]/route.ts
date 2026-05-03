import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/upload';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const purchase = await prisma.purchase.findUnique({
      where: { downloadToken: token },
      include: { digitalNewspaper: true }
    });

    if (!purchase || purchase.status !== 'COMPLETED') {
      return new NextResponse("Paiement non validé ou lien invalide.", { status: 403 });
    }

    const MAX_DOWNLOADS = 5;
    if (purchase.downloadCount >= MAX_DOWNLOADS) {
      return new NextResponse("Limite de téléchargements atteinte pour ce lien. Contactez le support.", { status: 403 });
    }

    const pdfUrl = purchase.digitalNewspaper.pdfUrl;
    
    // Increment download count
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { downloadCount: { increment: 1 } }
    });

    // If it's an external URL (e.g. S3, external storage), redirect
    if (pdfUrl.startsWith('http')) {
      return NextResponse.redirect(pdfUrl);
    }

    let filePath = '';
    
    // Check if it's the new format (/api/media/...)
    if (pdfUrl.startsWith('/api/media/')) {
      const filename = path.basename(pdfUrl.replace('/api/media/', ''));
      filePath = path.join(UPLOAD_DIR, filename);
    } 
    // Fallback to old format (/uploads/...)
    else {
      const filename = path.basename(pdfUrl);
      filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    }
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Fichier introuvable sur le serveur.", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Le_Debat_Ivoirien_${purchase.digitalNewspaper.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erreur de téléchargement PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
