import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, FileText, Mail, MessageSquare } from 'lucide-react';

export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Bonjour ! Je suis votre assistant FacturePME IA. Comment puis-je vous aider aujourd\'hui ? (ex: "Génère une facture pour création de site web à 1500€ pour le client Acme Corp")' }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const newMessages = [...messages, { id: Date.now(), role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      
      setMessages(msgs => [...msgs, { 
        id: Date.now(), 
        role: 'assistant', 
        text: data.reply || "Une erreur est survenue." 
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-accent-primary" size={24} />
          Assistant IA (Gemini)
        </h1>
        <p className="text-secondary mt-1">Laissez l'IA gérer la rédaction et les relances</p>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-surface-color border border-gray-200 rounded-lg overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)' }}>
          
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-gray-50" style={{ backgroundColor: '#F9FAFB' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-accent-light text-accent-primary'}`} style={msg.role === 'user' ? { backgroundColor: '#E5E7EB' } : { backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-lg text-sm ${msg.role === 'user' ? 'bg-accent-primary text-white' : 'bg-white border shadow-sm'}`} style={msg.role === 'user' ? { backgroundColor: 'var(--accent-primary)', color: 'white' } : { borderColor: 'var(--border-color)' }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t" style={{ borderColor: 'var(--border-color)' }}>
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                className="input flex-1" 
                placeholder="Demandez à l'IA de créer une facture, analyser un retard, etc."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="btn btn-primary" disabled={!input.trim() || isLoading}>
                {isLoading ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="w-80 flex flex-col gap-4">
          <h3 className="font-semibold text-secondary uppercase tracking-wider text-sm">Actions Rapides</h3>
          
          <button className="card flex items-center gap-3 p-4 hover:border-accent-primary transition-colors text-left" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm">Générer facture</div>
              <div className="text-xs text-muted">À partir d'un devis ou texte</div>
            </div>
          </button>

          <button className="card flex items-center gap-3 p-4 hover:border-accent-primary transition-colors text-left" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm">Rédiger relance</div>
              <div className="text-xs text-muted">Pour les factures en retard</div>
            </div>
          </button>

          <button className="card flex items-center gap-3 p-4 hover:border-accent-primary transition-colors text-left" style={{ borderColor: 'var(--border-color)' }}>
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm">Message WhatsApp</div>
              <div className="text-xs text-muted">Rappel amical via WhatsApp</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
