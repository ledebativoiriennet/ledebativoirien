import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveUpload } from '@/lib/upload';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.json({ error: "Unauthorized. Action requires ADMIN or EDITOR role." }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const issueNumber = formData.get('issueNumber') ? parseInt(formData.get('issueNumber') as string, 10) : null;
    const price = parseFloat(formData.get('price') as string);
    const isActive = formData.get('isActive') === 'true';
    
    const pdfFile = formData.get('pdfFile') as File | null;
    const coverFile = formData.get('coverFile') as File | null;

    if (!title || isNaN(price)) {
      return NextResponse.json({ error: "Le titre et le prix sont invalides." }, { status: 400 });
    }

    const updateData: any = {
      title,
      description,
      issueNumber,
      price,
      isActive,
    };

    if (pdfFile) {
      updateData.pdfUrl = await saveUpload(pdfFile);
    }

    if (coverFile) {
      updateData.coverImageUrl = await saveUpload(coverFile);
    }

    const newspaper = await prisma.digitalNewspaper.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, newspaper });

  } catch (error: any) {
    console.error("Erreur modification marketplace PDF:", error);
    return NextResponse.json({ error: `Erreur serveur: ${error.message || String(error)}` }, { status: 500 });
  }
}
