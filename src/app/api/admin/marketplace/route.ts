import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directories exist
const setupDirectories = () => {
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  const pdfDir = path.join(uploadsDir, 'pdf');
  const coversDir = path.join(uploadsDir, 'covers');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);
  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir);

  return { pdfDir, coversDir };
};

export async function POST(request: Request) {
  try {
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

    const dirs = setupDirectories();

    // Save PDF
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfExt = path.extname(pdfFile.name) || '.pdf';
    const pdfFilename = `journal_${uuidv4()}${pdfExt}`;
    const pdfPath = path.join(dirs.pdfDir, pdfFilename);
    fs.writeFileSync(pdfPath, pdfBuffer);
    const pdfUrl = `/uploads/pdf/${pdfFilename}`;

    // Save Cover
    let coverUrl = null;
    if (coverFile) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      const coverExt = path.extname(coverFile.name) || '.jpg';
      const coverFilename = `cover_${uuidv4()}${coverExt}`;
      const coverPath = path.join(dirs.coversDir, coverFilename);
      fs.writeFileSync(coverPath, coverBuffer);
      coverUrl = `/uploads/covers/${coverFilename}`;
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

  } catch (error) {
    console.error("Erreur création marketplace PDF:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
