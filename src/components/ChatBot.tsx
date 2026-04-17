"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChat } from "@/hooks/useChat";
import { useAdminData } from "@/hooks/useAdminData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  "Quels sont les produits populaires ?",
  "Comment se passe la livraison ?",
  "Avez-vous des vêtements en coton ?",
  "Où se trouve votre boutique ?",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const { products } = useAdminData();
  const { messages, sendMessage, isLoading, clearChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le dernier message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    sendMessage(messageText, products);
    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(10px)" }}
            className="absolute bottom-20 right-0 w-[92vw] md:w-[420px] h-[600px] bg-white rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Header premium */}
            <div className="bg-primary p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-xl shadow-inner">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl leading-none flex items-center gap-2">
                      Bayo AI <Sparkles className="h-3 w-3 text-amber-300 fill-current" />
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
                        Expert Mode en ligne
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-white/10 text-white h-9 w-9"
                    onClick={clearChat}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-white/10 text-white h-9 w-9"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/30"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i}
                  className={cn(
                    "max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-white ml-auto rounded-tr-none font-medium"
                      : "bg-white text-slate-800 mr-auto rounded-tl-none border border-slate-100"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        img: ({ src, alt }) => (
                          <img
                            src={src}
                            alt={alt}
                            className="rounded-lg max-w-full h-auto mt-2 mb-2"
                            style={{ maxHeight: '200px' }}
                          />
                        ),
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <div className="bg-white border border-slate-100 text-slate-400 p-4 rounded-[1.5rem] rounded-tl-none w-20 flex justify-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" />
                  <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Footer – suggestions & input */}
            <div className="p-6 border-t bg-white">
              {messages.length < 3 && !isLoading && (
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-100 hover:bg-primary/10 hover:text-primary text-[11px] font-bold transition-all border border-transparent hover:border-primary/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative flex items-center gap-2">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Écrivez à Bayo..."
                    className="rounded-2xl h-14 pl-6 pr-4 border-slate-100 bg-slate-50 focus:bg-white transition-all font-medium"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  />
                </div>
                <Button
                  size="icon"
                  className="rounded-2xl h-14 w-14 shadow-xl shadow-primary/20 flex-shrink-0"
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton principal */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center relative group transition-all duration-500",
          isOpen ? "bg-slate-900 text-white rotate-90" : "bg-primary text-white"
        )}
      >
        {!isOpen && (
          <div className="absolute inset-0 bg-primary rounded-[1.5rem] animate-ping opacity-20 group-hover:opacity-0 transition-opacity" />
        )}
        {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
        {!isOpen && (
          <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white">
            1
          </div>
        )}
      </motion.button>
    </div>
  );
}