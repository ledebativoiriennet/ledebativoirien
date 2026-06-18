'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { saveNewspaper, updateNewspaper } from '@/app/actions/marketplace';

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

  const uploadFileRaw = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const response = await fetch('/api/admin/marketplace/upload-raw', {
      method: 'POST',
      headers: {
        'x-filename': encodeURIComponent(file.name),
        'Content-Type': 'application/octet-stream'
      },
      body: arrayBuffer
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Erreur d'upload HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title || !formData.price || (!isEditing && !pdfFile)) {
      setError("Le titre, le prix et le fichier PDF sont obligatoires.");
      setLoading(false);
      return;
    }

    try {
      let uploadedPdfUrl: string | null = null;
      let uploadedCoverUrl: string | null = null;

      if (pdfFile) {
        uploadedPdfUrl = await uploadFileRaw(pdfFile);
      }

      if (coverFile) {
        uploadedCoverUrl = await uploadFileRaw(coverFile);
      }

      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('issueNumber', formData.issueNumber.trim());
      data.append('price', formData.price.trim());
      data.append('isActive', String(formData.isActive));
      
      if (uploadedPdfUrl) data.append('pdfUrl', uploadedPdfUrl);
      if (uploadedCoverUrl) data.append('coverImageUrl', uploadedCoverUrl);

      let result;
      if (isEditing) {
        result = await updateNewspaper(initialData.id, data);
      } else {
        result = await saveNewspaper(data);
      }

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'enregistrement");
      }

      router.push('/admin/marketplace');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      {error && (
        <div className="bg-red-900/50 border-l-4 border-[#ec1a24] text-red-100 p-4 rounded shadow-md flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold">Impossible d'enregistrer</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Section : Informations Générales */}
      <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-lg">
        <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#333]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📝</span> Informations Générales
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#aaa] mb-2">
              Titre du Journal <span className="text-[#ec1a24]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ec1a24] focus:border-transparent transition-all outline-none"
              placeholder="Ex: Le Débat Ivoirien N°150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-2">
              Numéro de parution
            </label>
            <input
              type="number"
              value={formData.issueNumber}
              onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ec1a24] focus:border-transparent transition-all outline-none"
              placeholder="Ex: 150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-2">
              Prix (FCFA) <span className="text-[#ec1a24]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 pr-16 text-white focus:ring-2 focus:ring-[#ec1a24] focus:border-transparent transition-all outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] font-medium">FCFA</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#aaa] mb-2">
              Description (Sommaire)
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ec1a24] focus:border-transparent transition-all outline-none resize-y"
              placeholder="Résumé des grands titres, interviews exclusives..."
            />
          </div>
        </div>
      </div>

      {/* Section : Fichiers */}
      <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-lg">
        <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#333]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📁</span> Fichiers & Médias
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-2">
              Fichier PDF {isEditing ? '(Optionnel si inchangé)' : <span className="text-[#ec1a24]">*</span>}
            </label>
            <div className="relative group">
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#444] rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] hover:border-[#ec1a24] transition-all cursor-pointer">
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                <span className="text-sm text-[#888] font-medium">
                  {pdfFile ? pdfFile.name : 'Cliquez ou glissez un PDF'}
                </span>
              </div>
              <input
                type="file"
                accept=".pdf"
                required={!isEditing}
                onChange={(e) => handleFileChange(e, setPdfFile)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {initialData?.pdfUrl && !pdfFile && (
              <p className="text-xs text-green-500 mt-2">✓ Un fichier PDF est déjà enregistré.</p>
            )}
          </div>

          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-2">
              Image de couverture (Optionnel)
            </label>
            <div className="relative group">
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#444] rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] hover:border-[#ec1a24] transition-all cursor-pointer overflow-hidden">
                {coverFile ? (
                   <div className="text-center">
                     <span className="text-3xl mb-2 block">🖼️</span>
                     <span className="text-sm text-[#888]">{coverFile.name}</span>
                   </div>
                ) : initialData?.coverImageUrl ? (
                   <div className="relative w-full h-full">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src={initialData.coverImageUrl} alt="Cover preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <span className="bg-black/70 px-3 py-1 rounded text-xs">Changer d'image</span>
                     </div>
                   </div>
                ) : (
                  <>
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🖼️</span>
                    <span className="text-sm text-[#888] font-medium">Glissez une image (JPG, PNG)</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setCoverFile)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="flex items-center mb-4 md:mb-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ml-3 text-sm font-bold text-white">
              {formData.isActive ? '🔥 En ligne (Visible)' : '🔒 Hors ligne (Brouillon)'}
            </span>
          </label>
        </div>

        <div className="flex space-x-4 w-full md:w-auto">
          <button
            type="button"
            onClick={() => router.push('/admin/marketplace')}
            className="flex-1 md:flex-none px-6 py-3 bg-[#111] hover:bg-[#222] border border-[#444] text-white rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 md:flex-none px-8 py-3 bg-[#ec1a24] hover:bg-red-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(236,26,36,0.4)]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Enregistrement...
              </>
            ) : (
              isEditing ? 'Mettre à jour' : 'Publier le journal'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
