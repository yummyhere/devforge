"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, CheckCircle2 } from "lucide-react";
import { t, Locale } from "@/lib/i18n";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  locale?: Locale;
  projectId?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ChatWidget({
  locale = "en",
  projectId,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: ChatWidgetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (externalOnClose && isOpen) {
      externalOnClose();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t(locale, "chat.placeholder") || "Hi! Ask me anything about building, customizing, or deploying your website.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          projectId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || "I am ready to help you build and customize your web application!";
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: replyText,
        };
        setMessages((prev) => [...prev, botMsg]);
        if (data.leadCaptured) {
          setLeadCaptured(true);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: errData.error || "Sorry, I encountered an issue processing your request.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't connect to the chat service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {externalIsOpen === undefined && !isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-50 p-4 bg-[#C87858] hover:bg-[#D98A68] text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer shadow-[#C87858]/30"
          title={t(locale, "chat.title")}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="hidden md:inline font-bold text-sm pr-1">{t(locale, "chat.title")}</span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D98A68] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C87858]"></span>
          </span>
        </button>
      )}

      {/* Chat Drawer Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-[#F0E8E0] border border-[#E8E0D0] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[600px] h-[85vh]">
          {/* Header */}
          <div className="bg-[#282824] p-4 text-white flex items-center justify-between border-b border-[#3d3d37]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#C87858]/30 border border-[#C87858]/40 flex items-center justify-center text-[#D98A68]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight text-white">{t(locale, "chat.title")}</h3>
                <p className="text-[11px] text-[#D8D8D0]">AI Assistant & Client Outreach</p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#D8D8D0] hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lead Captured Alert Banner */}
          {leadCaptured && (
            <div className="bg-[#75A86B]/15 border-b border-[#75A86B]/30 p-3 flex items-start gap-2.5 text-xs text-[#282824]">
              <CheckCircle2 className="w-4 h-4 text-[#75A86B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{t(locale, "chat.leadCaptured")}</p>
                <p className="text-[11px] text-[#75A86B] mt-0.5 font-medium">Lead extracted & saved to database.</p>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#F8F8F0]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-xl bg-[#C87858] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#C87858] text-white rounded-br-none font-medium"
                      : "bg-[#F0F0E8] text-[#282824] border border-[#D8D8D0] rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-[#282824] text-[#F8F8F0] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-[#C87858] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-[#F0F0E8] border border-[#D8D8D0] px-4 py-3 rounded-2xl rounded-bl-none text-xs text-[#88857D] flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C87858] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C87858] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C87858] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-[#F0E8E0] border-t border-[#E8E0D0] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t(locale, "chat.placeholder")}
              className="flex-1 px-3.5 py-2.5 bg-[#F0F0E8] border border-[#E8E8E8] text-xs text-[#282824] placeholder-[#88857D] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C87858]/20 focus:border-[#C87858] transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-[#C87858] hover:bg-[#D98A68] disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-md shadow-[#C87858]/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
