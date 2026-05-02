import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import NewspaperFormClient from '../nouveau/NewspaperFormClient';

export const metadata = {
  title: 'Modifier le Journal PDF - Admin',
};

export default async function EditNewspaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const newspaper = await prisma.digitalNewspaper.findUnique({
    where: { id }
  });

  if (!newspaper) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Modifier le Journal PDF</h1>
        <p className="text-[#888] mt-1">Mettez à jour les informations ou remplacez les fichiers du journal existant.</p>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
        <NewspaperFormClient initialData={newspaper} />
      </div>
    </div>
  );
}
