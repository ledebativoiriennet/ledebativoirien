"use server";

import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";
import { checkAdminOrEditor } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// --- BREAKING NEWS ---
export async function updateBreakingNews(content: string, link: string | null, isActive: boolean) {
  await checkAdminOrEditor();
  
  // On ne garde qu'un seul breaking news actif, on désactive les autres si celui-ci est actif
  if (isActive) {
    await prisma.breakingNews.updateMany({ data: { isActive: false } });
  }

  await prisma.breakingNews.create({
    data: { content, link, isActive }
  });

  await logActivity({
    action: "UPDATE_BREAKING_NEWS",
    details: `Contenu: ${content.substring(0, 50)}... | Actif: ${isActive}`
  });

  return { success: true };
}

export async function toggleBreakingNews(id: string, isActive: boolean) {
  await checkAdminOrEditor();
  if (isActive) {
    await prisma.breakingNews.updateMany({ data: { isActive: false } });
  }
  await prisma.breakingNews.update({ where: { id }, data: { isActive } });
  return { success: true };
}

// --- FLASH NEWS ---
export async function createFlashNews(time: string, content: string, source: string | null) {
  await checkAdminOrEditor();
  await prisma.flashNews.create({
    data: { time, content, source }
  });

  await logActivity({
    action: "CREATE_FLASH_NEWS",
    details: `Flash: ${content.substring(0, 50)}...`
  });

  return { success: true };
}

export async function deleteFlashNews(id: string) {
  await checkAdminOrEditor();
  await prisma.flashNews.delete({ where: { id } });

  await logActivity({
    action: "DELETE_FLASH_NEWS",
    resource: `Flash ID: ${id}`
  });

  return { success: true };
}

// --- TITROLOGIE ---
export async function uploadTitrologie(formData: FormData) {
  await checkAdminOrEditor();
  
  const newspaperName = formData.get("newspaperName") as string;
  const imageFile = formData.get("image") as File | null;
  const dateStr = formData.get("date") as string;

  if (!newspaperName || !imageFile || imageFile.size === 0) {
    return { success: false, error: "Le nom du journal et l'image sont obligatoires." };
  }

  try {
    const imageUrl = await saveUpload(imageFile);

    await prisma.titrologie.create({
      data: {
        newspaperName,
        imageUrl,
        date: dateStr ? new Date(dateStr) : new Date()
      }
    });

    await logActivity({
      action: "UPLOAD_TITROLOGIE",
      resource: newspaperName,
      details: `Une du ${dateStr || 'du jour'}`
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur Titrologie:", error);
    return { success: false, error: "Erreur lors de l'enregistrement de la titrologie." };
  }
}

export async function deleteTitrologie(id: string) {
  await checkAdminOrEditor();
  await prisma.titrologie.delete({ where: { id } });

  await logActivity({
    action: "DELETE_TITROLOGIE",
    resource: `Titrologie ID: ${id}`
  });

  return { success: true };
}

// --- SONDAGES ---
export async function createPoll(question: string, options: string[]) {
  try {
    await checkAdminOrEditor();
    
    // On désactive les sondages précédents pour n'avoir qu'un sondage du jour
    await prisma.poll.updateMany({ data: { isActive: false } });

    await prisma.poll.create({
      data: {
        question,
        isActive: true,
        options: {
          create: options.map(text => ({ text }))
        }
      }
    });

    await logActivity({
      action: "CREATE_POLL",
      resource: question,
      details: `Options: ${options.join(', ')}`
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur création sondage:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function togglePollStatus(id: string, isActive: boolean) {
  try {
    await checkAdminOrEditor();
    if (isActive) {
      await prisma.poll.updateMany({ data: { isActive: false } });
    }
    await prisma.poll.update({ where: { id }, data: { isActive } });
    return { success: true };
  } catch (error) {
    console.error("Erreur statut sondage:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deletePoll(id: string) {
  try {
    await checkAdminOrEditor();
    
    // Supprimer d'abord les options du sondage pour éviter l'erreur de clé étrangère (FK constraint)
    await prisma.pollOption.deleteMany({
      where: { pollId: id }
    });

    await prisma.poll.delete({ where: { id } });

    await logActivity({
      action: "DELETE_POLL",
      resource: `Poll ID: ${id}`
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur suppression sondage:", error);
    return { success: false, error: (error as Error).message };
  }
}

// --- AGENDA / ACTIVITES ---
export async function uploadActivity(formData: FormData) {
  await checkAdminOrEditor();
  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;
  const location = formData.get("location") as string;
  const link = formData.get("link") as string;
  const imageFile = formData.get("image") as File | null;

  if (!title || !dateStr || !location) {
    return { success: false, error: "Titre, date et lieu sont obligatoires." };
  }

  try {
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveUpload(imageFile);
    }

    await prisma.activity.create({
      data: { title, date: dateStr, location, link, imageUrl }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur Activity:", error);
    return { success: false, error: "Erreur lors de l'enregistrement de l'activité." };
  }
}

export async function deleteActivity(id: string) {
  await checkAdminOrEditor();
  await prisma.activity.delete({ where: { id } });

  await logActivity({
    action: "DELETE_ACTIVITY",
    resource: `Activity ID: ${id}`
  });

  return { success: true };
}

// --- NECROLOGIE ---
export async function createObituary(formData: FormData) {
  await checkAdminOrEditor();
  const name = formData.get("name") as string;
  const details = formData.get("details") as string;
  const imageFile = formData.get("image") as File | null;

  if (!name || !details) {
    return { success: false, error: "Nom et détails sont obligatoires." };
  }

  try {
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveUpload(imageFile);
    }

    await prisma.obituary.create({
      data: { name, details, imageUrl }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur Nécrologie:", error);
    return { success: false, error: "Erreur lors de l'enregistrement." };
  }
}

export async function deleteObituary(id: string) {
  await checkAdminOrEditor();
  await prisma.obituary.delete({ where: { id } });

  await logActivity({
    action: "DELETE_OBITUARY",
    resource: `Obituary ID: ${id}`
  });

  return { success: true };
}

// --- OFFRES EMPLOI ---
export async function createJobOffer(title: string, company: string, location: string, description: string, url: string) {
  await checkAdminOrEditor();
  await prisma.jobOffer.create({
    data: { title, company, location, description, url, isActive: true }
  });
  return { success: true };
}

export async function toggleJobOffer(id: string, isActive: boolean) {
  await checkAdminOrEditor();
  await prisma.jobOffer.update({ where: { id }, data: { isActive } });
  return { success: true };
}

export async function deleteJobOffer(id: string) {
  await checkAdminOrEditor();
  await prisma.jobOffer.delete({ where: { id } });
  return { success: true };
}

// --- SITE SETTINGS (SOCIALS) ---
export async function updateSiteSettings(data: { 
  facebookUrl?: string, 
  twitterUrl?: string, 
  instagramUrl?: string, 
  linkedinUrl?: string, 
  youtubeUrl?: string,
  facebookPageId?: string,
  facebookAccessToken?: string,
  twitterApiKey?: string,
  twitterApiSecret?: string,
  twitterAccessToken?: string,
  twitterAccessSecret?: string,
  linkedinAccessToken?: string,
  linkedinUrn?: string
}) {
  try {
    await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data }
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur updateSiteSettings:", error);
    return { success: false };
  }
}
