'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PredictionResultData } from '@/types';
import { sendAdvisorChat } from '@/lib/api';
import { Bot, Send, User, Sparkles, Trash2, Copy, Check, ShieldAlert } from 'lucide-react';

interface AiAdvisorProps {
  predictionContext?: PredictionResultData | null;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_CHIPS = [
  '💬 Explain my premium',
  '💬 Why is my premium high?',
  '💬 What is BMI?',
  '💬 Does smoking affect insurance?',
  '💬 What is a deductible?',
  '💬 What is co-payment?',
  '💬 What is a waiting period?',
  '💬 What is cashless hospitalization?',
  '💬 Difference between family and individual plans',
  '💬 How is health insurance premium calculated?',
];

export default function AiAdvisor({ predictionContext }: AiAdvisorProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: "Hello! I'm Aegis AI, your personal Health Insurance & Premium Advisor. How can I help you understand your premium estimate, insurance terms, or health profile today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      // Pass previous turns for conversation context
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
        content: "Conversation cleared! Ask me anything about your premium estimate, insurance coverage, or wellness tips.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <section className="bg-white dark:bg-[#121215] rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-colors">
      
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-[#18181C] border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base sm:text-lg">AI Insurance Advisor</h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                Domain Restricted
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Context-aware guidance for your insurance & health profile</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Window */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto bg-slate-50/30 dark:bg-[#09090B]/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs sm:text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`space-y-1.5 max-w-[85%] sm:max-w-[75%]`}>
              <div
                className={`p-4 rounded-2xl shadow-2xs leading-relaxed whitespace-pre-wrap ${
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
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Animation */}
        {loading && (
          <div className="flex gap-3 text-xs justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#18181C] border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <span>Aegis AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Question Chips */}
      <div className="px-4 py-3 bg-slate-100/70 dark:bg-[#18181C]/50 border-t border-b border-slate-200/60 dark:border-zinc-800/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {SUGGESTED_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white dark:bg-[#121215] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-300 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-white dark:bg-[#121215] flex items-center gap-3"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Aegis AI about your premium, deductibles, coverage..."
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#18181C] text-xs sm:text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Safety Disclaimer Footer */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-[#09090B] border-t border-slate-100 dark:border-zinc-800/80 text-[10px] text-slate-400 dark:text-zinc-500 text-center flex items-center justify-center gap-1.5">
        <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Aegis AI provides educational guidance only. For medical concerns or policy purchases, consult licensed professionals.</span>
      </div>

    </section>
  );
}
