import { Metadata } from "next";
import { getArchiveFilterOptions, getFilteredArticles } from "@/app/actions/archive-actions";
import ArchiveBrowser from "@/components/ArchiveBrowser";

export const metadata: Metadata = {
  title: "Archives - Le Débat Ivoirien",
  description: "Consultez et recherchez tous les articles publiés sur Le Débat Ivoirien, classés par thématique, catégorie et année.",
};

export default async function ArchivesPage() {
  const [filterOptions, initialData] = await Promise.all([
    getArchiveFilterOptions(),
    getFilteredArticles({ page: 1 }),
  ]);

  return (
    <ArchiveBrowser
      initialArticles={initialData.articles as any}
      initialTotal={initialData.total}
      hasInitialMore={initialData.hasMore}
      filterOptions={filterOptions}
    />
  );
}
