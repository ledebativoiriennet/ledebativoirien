import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

// Par défaut, stocker dans un dossier "shared_uploads" situé UN NIVEAU AU DESSUS du projet.
// Ainsi, les mises à jour du dossier du projet n'effaceront pas les images.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), '..', 'shared_uploads');

export async function saveUpload(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  await mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});
  const filePath = join(UPLOAD_DIR, filename);
  await writeFile(filePath, buffer);
  
  return `/api/media/${filename}`;
}
