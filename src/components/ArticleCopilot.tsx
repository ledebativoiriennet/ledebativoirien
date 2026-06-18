"use client";

import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function ArticleCopilot({ 
  articleTitle, 
  articleContent 
}: { 
  articleTitle: string, 
  articleContent: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! Je suis l'assistant IA du Débat Ivoirien. Avez-vous une question sur l'article "${articleTitle}" ? Je peux vous le résumer ou vous expliquer des concepts complexes.`
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract text content only for the AI context (max 5000 chars to save tokens)
  const articleContext = `Titre: ${articleTitle}\n\nContenu: ${articleContent.replace(/<[^>]*>?/gm, '').substring(0, 5000)}`;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          articleContext
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantText = "";
      
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "" }]);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          setMessages(prev => 
            prev.map(msg => msg.id === assistantId ? { ...msg, content: assistantText } : msg)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Désolé, une erreur est survenue. Veuillez réessayer plus tard." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: isOpen ? '420px' : '90px', // Above BackToTop on mobile
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#0f172a',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: isOpen ? 'scale(0.8)' : 'scale(1)',
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '350px',
          maxWidth: 'calc(100vw - 40px)',
          height: '400px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#0f172a',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>🤖</span> Copilote LDI
            <button 
              onClick={() => setMessages([{ id: 'welcome', role: 'assistant', content: `Bonjour ! Avez-vous une question sur l'article "${articleTitle}" ?` }])}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              🔄 Effacer
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#f8fafc'
          }}>
            {messages.map(m => (
              <div key={m.id} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: m.role === 'user' ? 'var(--primary)' : 'white',
                color: m.role === 'user' ? 'white' : 'var(--foreground)',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
                borderBottomLeftRadius: m.role === 'user' ? '12px' : '2px',
                maxWidth: '85%',
                fontSize: '0.9rem',
                boxShadow: m.role === 'user' ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                lineHeight: 1.4
              }}>
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className="dot-typing">L'IA réfléchit...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            padding: '0.75rem',
            backgroundColor: 'white',
            borderTop: '1px solid var(--border)',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question..."
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '9999px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !input.trim()) ? 0.5 : 1
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
