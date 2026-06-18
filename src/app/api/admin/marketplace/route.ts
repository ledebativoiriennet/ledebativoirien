import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveUpload } from '@/lib/upload';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Unauthorized. Action requires ADMIN or EDITOR role." }, { status: 401 });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const issueNumber = formData.get('issueNumber') ? parseInt(formData.get('issueNumber') as string, 10) : null;
    const price = parseFloat(formData.get('price') as string);
    const isActive = formData.get('isActive') === 'true';
    
    const pdfFile = formData.get('pdfFile') as File;
    const coverFile = formData.get('coverFile') as File | null;

    if (!title || isNaN(price) || !pdfFile) {
      return NextResponse.json({ error: "Données manquantes ou invalides." }, { status: 400 });
    }

    // Save PDF
    const pdfUrl = await saveUpload(pdfFile);

    // Save Cover
    let coverUrl = null;
    if (coverFile) {
      coverUrl = await saveUpload(coverFile);
    }

    const newspaper = await prisma.digitalNewspaper.create({
      data: {
        title,
        description,
        issueNumber,
        price,
        pdfUrl,
        coverImageUrl: coverUrl,
        isActive,
      }
    });

    return NextResponse.json({ success: true, newspaper });

  } catch (error: any) {
    console.error("Erreur création marketplace PDF:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message || String(error)}` }, { status: 500 });
  }
}
