import { NextRequest, NextResponse } from "next/server";
import { saveUpload } from "@/lib/upload";
import { checkAdminOrEditor } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    try {
      await checkAdminOrEditor();
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const url = await saveUpload(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
