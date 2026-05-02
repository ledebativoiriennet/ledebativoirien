"use client";

import { useState } from "react";

interface DownloadPdfButtonProps {
  articleTitle: string;
  articleContent: string;
  articleDate: string;
  articleImage?: string | null;
  authorName?: string;
  isPremium?: boolean;
  userHasAccess?: boolean;
}

export default function DownloadPdfButton({ 
  articleTitle, 
  articleContent, 
  articleDate, 
  articleImage,
  authorName,
  isPremium,
  userHasAccess
}: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isPremium && !userHasAccess) {
      alert("Vous devez être abonné Premium pour télécharger cet article.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Dynamic import of html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Create a temporary container for the PDF content
      const container = document.createElement('div');
      container.style.padding = '40px';
      container.style.fontFamily = '"Inter", sans-serif';
      container.style.color = '#000';
      container.style.backgroundColor = '#fff';
      
      // Add Logo and Header
      const header = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 50px; height: 50px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">LDI</div>
            <div style="display: flex; flex-direction: column; line-height: 1;">
              <span style="font-size: 24px; font-weight: 900; color: #000000; letter-spacing: -1px;">LeDébat</span>
              <span style="font-size: 24px; font-weight: 900; color: #dc2626; letter-spacing: 1px; font-family: Impact, sans-serif;">IVOIRIEN</span>
            </div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">${articleDate}</p>
            <p style="margin: 0;">www.ledebativoirien.net</p>
          </div>
        </div>
      `;
      
      // Add Title
      const titleSection = `
        <h1 style="font-size: 28px; font-weight: 800; color: #000000; margin-bottom: 20px; line-height: 1.2;">
          ${articleTitle}
        </h1>
        ${authorName ? `<p style="font-weight: bold; color: #dc2626; margin-bottom: 20px;">Par ${authorName}</p>` : ''}
      `;
      
      // Add Image
      const imageSection = articleImage ? `
        <div style="margin-bottom: 30px; text-align: center;">
          <img src="${articleImage}" style="max-width: 100%; max-height: 400px; border-radius: 8px;" crossorigin="anonymous" />
        </div>
      ` : '';
      
      // Clean content for PDF
      const cleanContent = articleContent.replace(/<img[^>]*>/g, ''); // Remove images from content to avoid pagination layout issues, or keep them if preferred
      
      const contentSection = `
        <div style="font-size: 16px; line-height: 1.8; color: #334155; text-align: justify;">
          ${articleContent}
        </div>
      `;
      
      // Add Footer
      const footer = `
        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 10px; color: #94a3b8;">
          <p>Document officiel - Le Débat Ivoirien - Tous droits réservés.</p>
          <p>Toute reproduction ou modification est strictement interdite.</p>
        </div>
      `;
      
      container.innerHTML = header + titleSection + imageSection + contentSection + footer;
      
      // Generate PDF
      const opt = {
        margin:       10,
        filename:     `${articleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(container).save();
      
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      alert("Une erreur est survenue lors de la génération du document.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isGenerating}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.2rem',
        backgroundColor: '#000000',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        borderRadius: '6px',
        border: 'none',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#000000'}
    >
      {isGenerating ? (
        <span>⏳ Création du PDF...</span>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {isPremium && !userHasAccess ? "Acheter / Télécharger (PDF)" : "Télécharger (PDF)"}
        </>
      )}
    </button>
  );
}
