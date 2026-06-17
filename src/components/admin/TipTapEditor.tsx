"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function TipTapEditor({
  value,
  onChange,
  placeholder = "Rédigez votre contenu ici...",
  minHeight = "400px",
  onImageUpload,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          style: "width:100%;max-width:100%;height:auto;border-radius:4px;margin:1.5rem 0;display:block;",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          style: "width:100%;max-width:100%;aspect-ratio:16/9;border-radius:4px;",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-content",
        style: `min-height:${minHeight};outline:none;`,
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes (e.g. draft restore)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageInsert = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        let url: string;
        if (onImageUpload) {
          url = await onImageUpload(file);
        } else {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
          const data = await res.json();
          if (!data.url) { alert("Erreur upload image"); return; }
          url = data.url;
        }
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (e) {
        console.error(e);
        alert("Erreur lors de l'upload de l'image");
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const handleYoutubeInsert = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Entrez l'URL YouTube :");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }, [editor]);

  const handleLinkInsert = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien :", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (
    active: boolean,
    onClick: () => void,
    label: string,
    title?: string
  ) => (
    <button
      type="button"
      onClick={onClick}
      title={title || label}
      style={{
        padding: "0.3rem 0.5rem",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer",
        fontWeight: active ? 700 : 400,
        backgroundColor: active ? "#e60000" : "transparent",
        color: active ? "white" : "#0f172a",
        fontSize: "0.85rem",
        minWidth: "28px",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2px",
          padding: "0.5rem",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
          alignItems: "center",
        }}
      >
        {/* History */}
        <button type="button" onClick={() => editor.chain().focus().undo().run()} title="Annuler" style={{ padding: "0.3rem 0.5rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px" }}>↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} title="Refaire" style={{ padding: "0.3rem 0.5rem", border: "none", background: "transparent", cursor: "pointer", borderRadius: "4px" }}>↪</button>
        <span style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }} />

        {/* Headings */}
        <select
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" :
            editor.isActive("heading", { level: 4 }) ? "4" :
            "0"
          }
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (val === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: val as any }).run();
          }}
          style={{ padding: "0.25rem", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85rem", backgroundColor: "white" }}
        >
          <option value="0">Paragraphe</option>
          <option value="1">Titre H1</option>
          <option value="2">Titre H2</option>
          <option value="3">Titre H3</option>
          <option value="4">Titre H4</option>
        </select>
        <span style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }} />

        {/* Text Format */}
        {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "G", "Gras")}
        {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "I", "Italique")}
        {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "S̲", "Souligné")}
        {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "S̶", "Barré")}
        <span style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }} />

        {/* Alignment */}
        {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), "⬤≡", "Gauche")}
        {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), "≡⬤≡", "Centré")}
        {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), "≡⬤", "Droite")}
        <span style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }} />

        {/* Lists */}
        {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "•≡", "Liste à puces")}
        {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "1≡", "Liste numérotée")}
        {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), "❝", "Citation")}
        {btn(editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run(), "</>", "Bloc code")}
        <span style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }} />

        {/* Media */}
        <button
          type="button"
          onClick={handleLinkInsert}
          title="Insérer un lien"
          style={{ padding: "0.3rem 0.5rem", borderRadius: "4px", border: "none", cursor: "pointer", backgroundColor: editor.isActive("link") ? "#e60000" : "transparent", color: editor.isActive("link") ? "white" : "#0f172a", fontSize: "0.85rem" }}
        >
          🔗
        </button>
        <button type="button" onClick={handleImageInsert} title="Insérer une image" style={{ padding: "0.3rem 0.5rem", borderRadius: "4px", border: "none", cursor: "pointer", background: "transparent", fontSize: "0.85rem" }}>🖼️</button>
        <button type="button" onClick={handleYoutubeInsert} title="Insérer une vidéo YouTube" style={{ padding: "0.3rem 0.5rem", borderRadius: "4px", border: "none", cursor: "pointer", background: "transparent", fontSize: "0.85rem" }}>▶️</button>
        <span style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }} />

        {/* Color */}
        <label title="Couleur du texte" style={{ display: "flex", alignItems: "center", gap: "2px", cursor: "pointer", fontSize: "0.85rem" }}>
          🎨
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
            style={{ width: "22px", height: "22px", padding: 0, border: "none", cursor: "pointer", borderRadius: "2px" }}
          />
        </label>
        <span style={{ width: "1px", height: "24px", background: "#cbd5e1", margin: "0 4px" }} />

        {/* HR & Clean */}
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Séparateur horizontal" style={{ padding: "0.3rem 0.5rem", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.85rem" }}>—</button>
        <button type="button" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Effacer le formatage" style={{ padding: "0.3rem 0.5rem", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.85rem" }}>✕</button>
      </div>

      {/* Editor Content */}
      <div style={{ padding: "1rem" }}>
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .tiptap-content {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.7;
          color: #0f172a;
          word-break: normal;
          overflow-wrap: break-word;
        }
        .tiptap-content p {
          margin-bottom: 1rem;
        }
        .tiptap-content h1, .tiptap-content h2, .tiptap-content h3,
        .tiptap-content h4, .tiptap-content h5, .tiptap-content h6 {
          font-weight: 800;
          line-height: 1.25;
          margin: 1.5rem 0 0.75rem;
        }
        .tiptap-content h1 { font-size: 1.75rem; }
        .tiptap-content h2 { font-size: 1.5rem; }
        .tiptap-content h3 { font-size: 1.25rem; }
        .tiptap-content ul, .tiptap-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .tiptap-content li { margin-bottom: 0.3rem; }
        .tiptap-content blockquote {
          border-left: 4px solid #e60000;
          padding-left: 1rem;
          color: #475569;
          font-style: italic;
          margin: 1.5rem 0;
        }
        .tiptap-content pre {
          background: #1e293b;
          color: #f8fafc;
          border-radius: 6px;
          padding: 1rem;
          overflow-x: auto;
          font-size: 0.9rem;
        }
        .tiptap-content img {
          max-width: 100% !important;
          width: 100% !important;
          height: auto !important;
          border-radius: 4px;
          margin: 1rem 0;
          display: block;
        }
        .tiptap-content a {
          color: #e60000;
          text-decoration: underline;
        }
        .tiptap-content hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 2rem 0;
        }
        .tiptap-content iframe {
          width: 100%;
          max-width: 100%;
          aspect-ratio: 16/9;
          border-radius: 4px;
        }
        /* Placeholder */
        .tiptap-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          float: left;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
