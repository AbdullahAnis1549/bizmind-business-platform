import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  User,
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Info,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { aiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormattedAIMessage from '../../components/common/FormattedAIMessage';

export const AIAssistant = () => {
  const { business, user } = useAuth();
  const { toastError } = useToast();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I'm your **BizMind AI Business Copilot** for **${business?.name || 'your workspace'}**.

I have direct access to your live product catalog, orders, revenues, and CRM records. Ask me anything about your current sales velocity, low-stock warnings, top clients, or strategic levers to grow margins!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await aiService.getStatus();
        if (res.success) {
          setAiStatus(res);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const promptSuggestions = [
    'What were my total sales and revenue this month?',
    'Which products are performing best in my catalog?',
    'Which products are low in stock or need reordering?',
    'Who are my top customers by lifetime spend?',
    'What should I focus on improving this quarter?',
    'Give me an executive diagnostic of my business performance.',
  ];

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');

    // Append user message
    const userMsg = { role: 'user', content: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      setLoading(true);
      const res = await aiService.chat(query);

      if (res.success) {
        const assistantMsg = {
          role: 'assistant',
          content: res.answer,
          provider: res.provider,
          model: res.model,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error querying AI Assistant:** ${err.message || 'Failed to analyze business metrics.'}`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-slate-900 text-base">
                AI Business Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Grounded in DB Data
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Engine: {aiStatus ? `${aiStatus.provider} (${aiStatus.model})` : 'Connecting to AI Engine...'}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content: `Chat history cleared. What business insights can I extract for you today?`,
                timestamp: new Date(),
              },
            ])
          }
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Rule-based Mode Banner (Only show once aiStatus is loaded AND confirmed in rule_based mode) */}
      {aiStatus && (!aiStatus.hasApiKey || aiStatus.mode === 'rule_based') && (
        <div className="flex items-center gap-2.5 px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Rule-based mode: add an AI key to enable the AI assistant</span>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {m.role === 'user' ? (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none shadow-sm shadow-brand-500/20'
                  : m.isError
                  ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs'
              }`}
            >
              {/* Markdown Content Formatter */}
              <FormattedAIMessage content={m.content} isUser={m.role === 'user'} />

              <div
                className={`text-[10px] mt-2 pt-1 border-t ${
                  m.role === 'user'
                    ? 'text-brand-200 border-brand-500/30 text-right'
                    : 'text-slate-400 border-slate-200/60'
                }`}
              >
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {m.provider && ` • ${m.provider}`}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              <span>Querying MongoDB aggregates and synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Bar */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-600" /> Prompts:
        </span>
        {promptSuggestions.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p)}
            disabled={loading}
            className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600 shrink-0 shadow-2xs transition disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200/80 bg-white">
        <div className="flex items-center gap-2">
          <textarea
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about sales, top products, reorder alerts, customer spend..."
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none max-h-32"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-40 text-white font-semibold transition flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
