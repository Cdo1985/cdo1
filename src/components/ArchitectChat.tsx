import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { MessageSquare, Send, Sparkles, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";

interface ArchitectChatProps {
  onSendMessage: (text: string) => Promise<ChatMessage | null>;
  history: ChatMessage[];
  loading: boolean;
}

const PRESETS = [
  "Explain pitstop.py architecture",
  "How pgvector embedding search works?",
  "How to scale this with CrewAI agents?",
  "Write main.py integration example"
];

export default function ArchitectChat({ onSendMessage, history, loading }: ArchitectChatProps) {
  const [inputText, setInputText] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleSubmit = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const query = (customText || inputText).trim();
    if (!query) return;

    setInputText("");
    setErrorText(null);

    try {
      const response = await onSendMessage(query);
      if (!response) {
        setErrorText("Unable to communicate with the AI Gateway. Check your Secrets panel or internet connection.");
      }
    } catch (err: any) {
      setErrorText(err.message || "An unexpected error occurred during client-to-server request.");
    }
  };

  return (
    <div className="flex flex-col h-[580px] bg-[#0f172a]/30 border border-sky-900/40 rounded-2xl overflow-hidden shadow-xl glass-panel">
      {/* Chat header */}
      <div className="px-5 py-4 bg-[#020512] border-b border-sky-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200 font-display">Live AI Gateway Expert</h4>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Real-time Gemini flash-3.5 online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-slate-550 border border-sky-900/10 bg-slate-950/80 px-2 py-0.5 rounded">NODE // TRACE-04</span>
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse hidden sm:block" />
        </div>
      </div>

      {/* Messages layout */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-6">
            <div className="w-12 h-12 rounded-full bg-slate-950 border border-sky-900/30 flex items-center justify-center text-slate-400 animate-bounce">
              <HelpCircle className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <p className="text-sm text-slate-200 font-semibold px-4 font-display">
                Welcome to the Agent Gateway Architecture Space!
              </p>
              <p className="text-xs text-slate-400 px-6 mt-1.5 leading-relaxed">
                Ask me complete technical insights about pgvector indices, subclass wrapping of OpenAI, Docker layouts, or how to inject custom system policies.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="w-full max-w-sm space-y-2 mt-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block text-left mb-1 font-mono">
                Suggested topics
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(undefined, preset)}
                    className="w-full flex items-center justify-between text-left text-xs bg-slate-950/80 hover:bg-slate-900/60 px-3 py-2 border border-sky-950 hover:border-sky-900/40 text-slate-350 rounded-lg transition-all text-[11px] group cursor-pointer"
                    disabled={loading}
                  >
                    <span>{preset}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {history.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border font-mono text-[10px] font-bold ${
                    msg.role === "user"
                      ? "bg-sky-955/20 border-sky-505/20 text-sky-450"
                      : "bg-slate-950 border-sky-950/80 text-slate-300"
                  }`}
                >
                  {msg.role === "user" ? "U" : "GW"}
                </div>

                {/* Content block */}
                <div className={`p-3.5 rounded-2xl h-fit text-xs leading-relaxed border ${
                  msg.role === "user" 
                    ? "bg-sky-500/10 text-sky-200 border-sky-500/15 rounded-tr-none" 
                    : "bg-[#030712]/80 text-slate-300 border-sky-950 rounded-tl-none font-sans"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[9px] text-slate-500 mt-1.5 block text-right font-mono">
                    {msg.timestamp.split("T")[1]?.substring(0, 5) || "Now"}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center font-sans">
                <div className="w-7 h-7 rounded-lg bg-slate-950 border border-sky-950/60 flex items-center justify-center text-slate-400 text-[10px] font-bold font-mono">
                  GW
                </div>
                <div className="bg-[#030712]/80 border border-sky-950 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}

            {errorText && (
              <div className="bg-rose-955/20 text-rose-455 text-xs border border-rose-905/30 p-3 rounded-xl flex items-start gap-2.5 font-sans">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-rose-300">Live API Warning</p>
                  <p className="mt-0.5 leading-relaxed">{errorText}</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleSubmit(e)} className="p-4 bg-[#020512] border-t border-sky-900/20 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a technical gateway question..."
          className="flex-1 bg-slate-950 px-3.5 py-2 border border-sky-900/30 focus:outline-none focus:border-sky-500/50 rounded-xl text-xs text-slate-200 font-sans"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-sky-400 hover:bg-sky-300 disabled:bg-slate-950 text-slate-950 disabled:text-slate-600 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-center cursor-pointer"
          disabled={loading || !inputText.trim()}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
