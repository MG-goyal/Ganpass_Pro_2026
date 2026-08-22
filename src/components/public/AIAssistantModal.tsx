import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Compass, Clock, MapPin, Loader2 } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendations?: string[];
  suggested_mandals?: string[];
  timestamp: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMandalId?: string;
  initialMandalName?: string;
}

const QUICK_PROMPTS = [
  'What is the best time to visit Lalbaugcha Raja?',
  'How to reach GSB Seva Mandal by train?',
  'Which mandals have the shortest waiting queues right now?',
  'Eco-friendly Ganpati idols in Girgaon',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialMandalId,
  initialMandalName,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaskar & Ganpati Bappa Morya! 🙏 I am your official Mumbai Ganesh Festival 2026 AI Darshan Guide. Ask me anything about darshan timings, nearest local trains, crowd tips, or route advice.',
      recommendations: [
        'Lalbaugcha Raja 24h Darshan schedule',
        'GSB Gold Ganpati 5-Day Darshan pass info',
        'Girgaon & Khetwadi walking circuits',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialMandalName && messages.length === 1) {
      handleSend(`Tell me about darshan timings, crowd management, and how to reach ${initialMandalName}.`);
    }
  }, [isOpen, initialMandalName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiRequest<{
        answer: string;
        recommendations?: string[];
        suggested_mandals?: string[];
      }>('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({
          query: textToSend,
          context_mandal_id: initialMandalId,
        }),
      });

      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: res.answer || 'Ganpati Bappa Morya! Have a peaceful and blessed darshan.',
        recommendations: res.recommendations || [],
        suggested_mandals: res.suggested_mandals || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'For the best experience during Ganeshotsav 2026, we recommend early morning darshan between 6:00 AM - 9:00 AM. Key mandals like Lalbaugcha Raja and GSB Seva Mandal are reachable via Chinchpokli and King\'s Circle stations.',
          recommendations: [
            'Arrive before 8:00 AM for shortest queue wait times',
            'Travel via suburban railway line to avoid major road blocks',
            'Keep your GPS active to claim your GanPass 10 stamp',
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        id="ai-assistant-modal"
        className="relative w-full max-w-2xl h-[85vh] max-h-[700px] flex flex-col bg-white rounded-2xl shadow-2xl border border-amber-200/80 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-amber-700 via-orange-600 to-amber-800 text-white shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg leading-tight flex items-center gap-2">
                AI Darshan & Route Guide
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/25">
                  Gemini 2.5
                </span>
              </h2>
              <p className="text-xs text-amber-100/90">Mumbai Ganeshotsav 2026 Real-Time Assistant</p>
            </div>
          </div>
          <button
            id="close-ai-modal-button"
            onClick={onClose}
            aria-label="Close Assistant"
            className="p-2 rounded-xl text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-amber-50/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white'
                    : 'bg-orange-100 text-orange-800 border border-orange-200'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-amber-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-amber-100/80 space-y-1.5">
                    <p className="text-[11px] font-semibold tracking-wider text-amber-800 uppercase flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" /> Recommendations
                    </p>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {msg.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    msg.sender === 'user' ? 'text-amber-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 border border-orange-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-amber-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>Consulting pilgrimage database & real-time queue intelligence...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-amber-50/60 border-t border-amber-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-medium text-amber-900 shrink-0">Quick Ask:</span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs bg-white text-slate-700 hover:text-amber-800 hover:bg-amber-100/60 border border-amber-200 rounded-full px-3 py-1 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-2"
        >
          <input
            id="ai-query-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask in Marathi, Hindi, or English (e.g., When is Lalbaugcha Raja aarti?)..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
          <button
            id="send-ai-query-button"
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
