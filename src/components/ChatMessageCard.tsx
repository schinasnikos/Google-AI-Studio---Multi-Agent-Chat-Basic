import React, { useState } from "react";
import Markdown from "react-markdown";
import { ChatMessage } from "../types";
import { COLOR_THEMES } from "../data/presets";
import { Copy, Check, AtSign, Bot, User, CornerDownLeft, RotateCcw } from "lucide-react";

interface ChatMessageCardProps {
  message: ChatMessage;
  onMentionOrReply?: (name: string, text?: string) => void;
  onRetry?: (message: ChatMessage) => void;
}

export const ChatMessageCard: React.FC<ChatMessageCardProps> = ({
  message,
  onMentionOrReply,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);

  const isUser = message.senderType === "user";
  const isHuman = message.senderType === "human";
  const isBot = message.senderType === "bot";

  const theme =
    isBot && message.color
      ? COLOR_THEMES[message.color] || COLOR_THEMES.indigo
      : COLOR_THEMES.indigo;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      id={`message-${message.id}`}
      className={`group relative flex gap-3.5 sm:gap-4 py-2.5 transition-all ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar column */}
      <div className="flex-shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-200 flex items-center justify-center text-sm shadow-md glow-indigo">
            {message.avatar || "👤"}
          </div>
        ) : isHuman ? (
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center text-sm shadow-md glow-emerald">
            {message.avatar || "👩‍💻"}
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-all ${theme.border} ${theme.bgSubtle} ${theme.glow} ${theme.text}`}
          >
            {message.avatar || "🤖"}
          </div>
        )}
      </div>

      {/* Message content container */}
      <div
        className={`max-w-[84%] sm:max-w-[80%] flex flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {/* Name and badges row */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className={`text-xs font-bold ${isBot ? theme.text : isUser ? "text-indigo-300" : "text-emerald-400"}`}>
            {message.senderName}
          </span>

          {isUser && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider font-semibold">
              User
            </span>
          )}

          {isHuman && !isUser && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider font-semibold">
              Human
            </span>
          )}

          {isBot && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded ${theme.badge} uppercase tracking-wider font-semibold`}
            >
              AI Agent
            </span>
          )}

          <span className="text-[10px] text-slate-500 font-mono">
            {formattedTime}
          </span>
        </div>

        {/* Bubble card */}
        <div
          className={`relative rounded-2xl p-4 sm:p-5 text-sm leading-relaxed transition-all shadow-sm ${
            isUser
              ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tr-none backdrop-blur-md"
              : isHuman
              ? "glass-panel text-slate-200 rounded-tl-none backdrop-blur-md"
              : `glass-panel text-slate-300 rounded-tl-none ${theme.border}`
          }`}
        >
          {/* Text/Markdown content */}
          <div className="prose prose-invert prose-sm max-w-none break-words leading-relaxed space-y-2">
            <Markdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-300 leading-relaxed">{children}</p>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="px-1.5 py-0.5 rounded bg-white/5 text-indigo-300 font-mono text-xs border border-white/10">
                      {children}
                    </code>
                  ) : (
                    <pre className="p-3.5 my-2 rounded-xl bg-black/60 overflow-x-auto border border-white/10 font-mono text-xs text-slate-200">
                      <code>{children}</code>
                    </pre>
                  );
                },
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-1.5 text-slate-300">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-1.5 text-slate-300">{children}</ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-indigo-500/60 pl-3 py-0.5 text-slate-400 italic my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.text}
            </Markdown>
          </div>

          {/* Streaming blinking cursor */}
          {message.isStreaming && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-indigo-400 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} active-indicator`} />
              <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">generating response...</span>
            </span>
          )}

          {/* Error notice if message failed */}
          {message.error && (
            <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-rose-400/90 font-medium">
                Issue encountered during generation.
              </span>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message)}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry response</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hover Action controls */}
        <div
          className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1 text-zinc-400 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 text-xs flex items-center gap-1 transition-colors"
            title="Copy text"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span className="text-[11px]">{copied ? "Copied" : "Copy"}</span>
          </button>

          {onMentionOrReply && (
            <button
              type="button"
              onClick={() => onMentionOrReply(message.senderName, message.text)}
              className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 text-xs flex items-center gap-1 transition-colors"
              title="Mention in chat"
            >
              <AtSign className="w-3 h-3" />
              <span className="text-[11px]">Mention</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
