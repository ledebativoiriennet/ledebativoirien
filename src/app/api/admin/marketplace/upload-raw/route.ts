import { NextRequest, NextResponse } from "next/server";
import { saveUpload } from "@/lib/upload";
import { checkAdminOrEditor } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { UPLOAD_DIR } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    try {
      await checkAdminOrEditor();
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    const filename = req.headers.get("x-filename");
    if (!filename) {
      return NextResponse.json({ error: "No filename provided in headers" }, { status: 400 });
    }

    // Read the raw binary stream into a buffer
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error: any) {
      console.error("Erreur création dossier UPLOAD_DIR:", error.message);
    }

    const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(UPLOAD_DIR, safeFilename);
    await writeFile(filePath, buffer);
    
    const url = `/api/media/${safeFilename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Raw Upload Error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
