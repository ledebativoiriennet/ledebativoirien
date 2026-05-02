'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewspaperFormClient({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    issueNumber: initialData?.issueNumber ? String(initialData.issueNumber) : '',
    price: initialData?.price ? String(initialData.price) : '500',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If creating, PDF is required. If editing, PDF is optional (we keep the old one).
    if (!formData.title || !formData.price || (!isEditing && !pdfFile)) {
      setError("Le titre, le prix et le fichier PDF sont obligatoires.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('issueNumber', formData.issueNumber);
      data.append('price', formData.price);
      data.append('isActive', String(formData.isActive));
      
      if (coverFile) data.append('coverFile', coverFile);
      if (pdfFile) data.append('pdfFile', pdfFile);

      const endpoint = isEditing ? `/api/admin/marketplace/${initialData.id}` : '/api/admin/marketplace';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }

      router.push('/admin/marketplace');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-900 border border-red-800 text-red-200 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#888] mb-1">
            Titre <span className="text-[#ec1a24]">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-[#111] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#ec1a24]"
            placeholder="Ex: Le Débat Ivoirien N°150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#888] mb-1">
            Prix (FCFA) <span className="text-[#ec1a24]">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full bg-[#111] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#ec1a24]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#888] mb-1">
            Numéro de parution
          </label>
          <input
            type="number"
            value={formData.issueNumber}
            onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
            className="w-full bg-[#111] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#ec1a24]"
            placeholder="Ex: 150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#888] mb-1">
            Statut
          </label>
          <div className="flex items-center h-[50px]">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ec1a24] relative"></div>
              <span className="ml-3 text-sm font-medium text-white">
                {formData.isActive ? 'Actif (Visible en boutique)' : 'Inactif (Brouillon)'}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#888] mb-1">
          Description
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-[#111] border border-[#333] rounded p-3 text-white focus:outline-none focus:border-[#ec1a24]"
          placeholder="Résumé des grands titres..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#888] mb-1">
            Fichier PDF {isEditing ? '(Optionnel si inchangé)' : <span className="text-[#ec1a24]">*</span>}
          </label>
          <input
            type="file"
            accept=".pdf"
            required={!isEditing}
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="w-full bg-[#111] border border-[#333] rounded p-2 text-white focus:outline-none focus:border-[#ec1a24]"
          />
          <p className="text-xs text-[#666] mt-1">Le journal complet au format PDF.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#888] mb-1">
            Image de couverture (Optionnel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            className="w-full bg-[#111] border border-[#333] rounded p-2 text-white focus:outline-none focus:border-[#ec1a24]"
          />
          <p className="text-xs text-[#666] mt-1">Image JPG ou PNG.</p>
        </div>
      </div>

      <div className="pt-4 flex space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/marketplace')}
          className="bg-transparent border border-[#333] hover:bg-[#222] text-white px-6 py-3 rounded font-medium transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ec1a24] hover:bg-red-700 text-white px-6 py-3 rounded font-medium transition-colors disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Enregistrement...
            </>
          ) : 'Enregistrer le journal'}
        </button>
      </div>
    </form>
  );
}
