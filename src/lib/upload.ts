import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

// Par défaut, stocker dans un dossier "shared_uploads" situé UN NIVEAU AU DESSUS du projet.
// Ainsi, les mises à jour du dossier du projet n'effaceront pas les images.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), '..', 'shared_uploads');

export async function saveUpload(file: File): Promise<string> {
  // 1. Validation de la taille (Max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`Le fichier dépasse la taille maximale autorisée de 5MB (Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB).`);
  }

  // 2. Validation du type MIME
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Type de fichier non autorisé : ${file.type}. Seuls les formats JPEG, PNG, WEBP, GIF et PDF sont acceptés.`);
  }

  // 3. Validation basique de l'extension pour double sécurité
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
  if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
    throw new Error(`Extension de fichier non autorisée : .${fileExt}`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error: any) {
    console.error("Erreur création dossier UPLOAD_DIR:", error.message);
  }
  const filePath = join(UPLOAD_DIR, filename);
  await writeFile(filePath, buffer);
  
  return `/api/media/${filename}`;
}
