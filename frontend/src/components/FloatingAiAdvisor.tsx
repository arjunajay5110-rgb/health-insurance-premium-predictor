'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PredictionResultData } from '@/types';
import { sendAdvisorChat } from '@/lib/api';
import { Bot, Send, User, Sparkles, Trash2, Copy, Check, X } from 'lucide-react';

interface FloatingAiAdvisorProps {
  predictionContext?: PredictionResultData | null;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const PRE_PREDICTION_CHIPS = [
  '💬 What is Health Insurance?',
  '💬 Nutrition & Diet Advice',
  '💬 Exercise & Fitness Tips',
  '💬 What is a Waiting Period?',
  '💬 What is Co-payment?',
  '💬 What is a Deductible?',
];

const POST_PREDICTION_CHIPS = [
  '💬 Explain my premium',
  '💬 How to improve my Health Score?',
  '💬 Weight loss & BMI advice',
  '💬 Why is my premium estimated like this?',
  '💬 What affected my premium?',
  '💬 Fitness & lifestyle recommendations',
];

export default function FloatingAiAdvisor({ predictionContext }: FloatingAiAdvisorProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const [hasContextNotified, setHasContextNotified] = useState<boolean>(false);

  const getInitialWelcomeMessage = (ctx?: PredictionResultData | null): string => {
    if (ctx && ctx.health_snapshot) {
      const snap = ctx.health_snapshot;
      return `👋 Welcome back!\n\nI've reviewed your latest health insurance prediction and I'm ready to help. Looking at your profile, your Health Score is **${snap.health_score}/100** (${snap.risk_level} Risk).\n\nWhether you'd like to understand why your premium was estimated the way it was, improve your health profile, compare plans, or ask health and nutrition questions, I'm here to help.\n\nWhat would you like to explore today?`;
    }
    return `👋 Welcome!\n\nI'm Aegis AI, your personal Health & Insurance Advisor.\n\nOnce you calculate your insurance premium, I'll use your health profile to provide personalized guidance. Until then, I can answer general questions about:\n\n• Health insurance & floaters\n• Nutrition & diet\n• Exercise & weight loss\n• BMI & Health Score\n• Insurance terms & deductibles\n\nWhat would you like to know?`;
  };

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: getInitialWelcomeMessage(predictionContext),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss initial tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-notify AI when prediction is generated
  useEffect(() => {
    if (predictionContext && !hasContextNotified) {
      setHasContextNotified(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const snap = predictionContext.health_snapshot;

      const updateMsg: MessageItem = {
        id: `ctx-${Date.now()}`,
        role: 'assistant',
        content: `👋 Welcome back!\n\nI've reviewed your latest health insurance prediction and I'm ready to help. Your Health Score is currently **${snap.health_score}/100** (${snap.risk_level} Risk).\n\nWhether you'd like to understand why your premium was estimated the way it was, improve your health profile, compare insurance plans, or ask nutrition questions, I'm here for you. What would you like to explore today?`,
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev, updateMsg]);
    }
  }, [predictionContext, hasContextNotified]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.replace(/^💬\s*/, ''),
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendAdvisorChat(userMsg.content, predictionContext, historyPayload);

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: res.timestamp || timeStr,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I am currently unable to process your request. Please try asking your question again in a moment.",
        timestamp: timeStr,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: getInitialWelcomeMessage(predictionContext),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const currentChips = predictionContext ? POST_PREDICTION_CHIPS : PRE_PREDICTION_CHIPS;

  return (
    <>
      {/* 1. Floating Welcome Tooltip Badge */}
      {showTooltip && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 max-w-xs bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 p-3.5 rounded-2xl shadow-2xl border border-slate-700 dark:border-zinc-300 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-start gap-2.5">
          <span className="text-base shrink-0">👋</span>
          <div className="space-y-1">
            <p className="font-semibold leading-snug">Need help understanding your insurance?</p>
            <p className="text-[11px] text-slate-300 dark:text-zinc-600">Ask Aegis AI Advisor.</p>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 dark:text-zinc-500 hover:text-white dark:hover:text-black p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Prominent Floating Action Pill Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="fixed bottom-6 right-6 z-50 px-4 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none ring-4 ring-blue-600/30 border border-blue-400/40"
        aria-label="Toggle AI Advisor"
        title="AI Advisor"
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12 text-blue-200 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600 animate-ping" />
            </>
          )}
        </div>
        <span className="font-extrabold text-xs sm:text-sm tracking-wide">
          {isOpen ? 'Close' : 'AI Advisor'}
        </span>
      </button>

      {/* 3. Slide-in Floating AI Advisor Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-white dark:bg-[#121215] rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 transition-colors">
          
          {/* Panel Header */}
          <div className="p-4 bg-slate-50/90 dark:bg-[#18181C] border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Aegis AI Advisor</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 text-[9px] font-bold">
                    Health AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Context-aware health & insurance coach</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                title="Minimize AI Advisor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-slate-50/30 dark:bg-[#09090B]/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="space-y-1 max-w-[85%]">
                  <div
                    className={`p-3 rounded-2xl shadow-2xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-[#18181C] border border-slate-200/90 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-tl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 dark:text-zinc-500 px-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-slate-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader */}
            {loading && (
              <div className="flex gap-2 text-xs justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-[#18181C] border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <span className="text-[11px]">Aegis AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Context Banner Tag */}
          <div className="px-3 py-1.5 bg-blue-50/70 dark:bg-zinc-800/60 border-t border-b border-slate-200/60 dark:border-zinc-800 text-[10px] text-blue-900 dark:text-blue-300 flex items-center justify-between shrink-0">
            <span>{predictionContext ? '💡 Health Profile Active' : '💡 General Guidance Mode'}</span>
            <span className="font-semibold">{predictionContext ? `Score ${predictionContext.health_snapshot.health_score}/100` : 'Health & Insurance Advisor'}</span>
          </div>

          {/* Suggested Question Chips */}
          <div className="px-3 py-2 bg-slate-100/60 dark:bg-[#18181C]/40 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
            {currentChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white dark:bg-[#121215] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-300 transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-[#121215] border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Aegis AI about insurance, nutrition, or fitness..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#18181C] text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
