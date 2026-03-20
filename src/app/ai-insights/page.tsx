"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const initialMessages = [
  {
    id: 1,
    role: "assistant",
    content: "Hi Alex! I'm Nexa AI, your personal financial advisor. How can I help you today?",
    time: "10:24 AM",
  },
  {
    id: 2,
    role: "user",
    content: "Please help me with my financial planning",
    time: "10:25 AM",
  },
  {
    id: 3,
    role: "assistant",
    content: "Sure Please Ask me anything related to your finance, ill help you with that",
    time: "10:25 AM",
  },
];

export default function AIInsights() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const query = inputValue.trim();
    const newUserMsg = {
      id: messages.length + 1,
      role: "user",
      content: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We only send the latest ones or formatted history. For now, sending all.
        body: JSON.stringify({ messages: [...messages, newUserMsg] }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, {
          id: prev.length + 1,
          role: "assistant",
          content: data.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to my servers right now.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col pb-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/20 rounded-xl neon-border-blue relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-400/20 blur-xl blink" />
          <Sparkles className="w-6 h-6 text-cyan-400 relative z-10" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-1 text-glow-cyan">Nexa AI</h2>
          <p className="text-slate-400 text-sm">Your intelligent financial companion</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-6 hidden-scrollbar flex flex-col gap-6 relative z-10">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                  msg.role === "user"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-blue-500/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                )}>
                  {msg.role === "user" ? (
                    <User className="w-5 h-5 text-slate-300" />
                  ) : (
                    <Bot className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className={cn(
                  "px-5 py-3.5 rounded-2xl relative group",
                  msg.role === "user"
                    ? "bg-blue-600 border border-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] rounded-tr-sm"
                    : "glass border border-white/10 text-slate-200 rounded-tl-sm"
                )}>
                  <p className="leading-relaxed text-[15px]">{msg.content}</p>
                  <span className={cn(
                    "text-[11px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity",
                    msg.role === "user" ? "right-1 text-slate-400" : "left-1 text-slate-400"
                  )}>
                    {msg.time}
                  </span>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4 max-w-[85%] mr-auto"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-blue-500/20 border-blue-500/30">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="px-5 py-4 rounded-2xl glass border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-cyan-400" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-cyan-400" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/5 bg-slate-900/40 relative z-10 backdrop-blur-xl">
          <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto items-center">
            <Input
              placeholder="Ask anything about your finances..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-slate-900 border-slate-700/50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
          <div className="flex gap-2 mt-3 justify-center text-xs text-slate-400">
            <span className="hidden sm:inline">Try asking:</span>
            <button onClick={() => setInputValue("How can I save more next month?")} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5">How can I save more next month?</button>
            <button onClick={() => setInputValue("Analyze my grocery spending")} className="hidden sm:block px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5">Analyze my grocery spending</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
