import React, { useState, useRef, useEffect } from "react";
import { Agent, OrchestrationMode, Participant } from "../types";
import { COLOR_THEMES } from "../data/presets";
import {
  Send,
  Square,
  AtSign,
  Sparkles,
  Users,
  ChevronDown,
  Layers,
} from "lucide-react";

interface ChatInputProps {
  agents: Agent[];
  participants: Participant[];
  currentSpeakerId: string;
  onSpeakerChange: (id: string) => void;
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  orchestrationMode: OrchestrationMode;
  onModeChange: (mode: OrchestrationMode) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  agents,
  participants,
  currentSpeakerId,
  onSpeakerChange,
  onSendMessage,
  isStreaming,
  onStopStreaming,
  orchestrationMode,
  onModeChange,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSpeakerMenu, setShowSpeakerMenu] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        160,
        textareaRef.current.scrollHeight
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isStreaming) return;
    onSendMessage(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertMention = (name: string) => {
    const mentionTag = `@${name} `;
    setText((prev) => {
      if (prev.endsWith(" ")) {
        return prev + mentionTag;
      } else if (prev.length > 0) {
        return prev + " " + mentionTag;
      } else {
        return mentionTag;
      }
    });
    textareaRef.current?.focus();
  };

  const currentSpeaker =
    participants.find((p) => p.id === currentSpeakerId) || participants[0];

  return (
    <div
      id="chat-input-container"
      className="border-t border-white/5 glass-panel p-4 sm:p-5 z-20"
    >
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Top Controls Bar: Mention Chips & Speaker & Mode */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Quick Mention Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full scrollbar-none">
            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 flex-shrink-0">
              <AtSign className="w-3 h-3 text-indigo-400" />
              <span>Target:</span>
            </span>

            <button
              type="button"
              onClick={() => insertMention("all")}
              className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-[10px] uppercase tracking-wider border border-white/10 transition-colors flex-shrink-0"
            >
              @all
            </button>

            {agents.map((agent) => {
              const theme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => insertMention(agent.name)}
                  className={`px-2.5 py-0.5 rounded-full ${theme.bgSubtle} hover:${theme.badge} ${theme.text} text-[10px] uppercase font-bold tracking-wider border ${theme.border} transition-colors flex items-center gap-1 flex-shrink-0`}
                >
                  <span>{agent.avatar}</span>
                  <span>{agent.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Right side controls: Mode toggle & Active Speaker */}
          <div className="flex items-center gap-2">
            {/* Orchestration Mode selector pill */}
            <select
              value={orchestrationMode}
              onChange={(e) => onModeChange(e.target.value as OrchestrationMode)}
              className="bg-white/5 border border-white/10 text-slate-300 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500/50"
              title="Change agent turn-taking strategy"
            >
              <option value="sequential" className="bg-zinc-900 text-slate-200">Mode: Sequential</option>
              <option value="parallel" className="bg-zinc-900 text-slate-200">Mode: Parallel</option>
              <option value="mentions" className="bg-zinc-900 text-slate-200">Mode: @Mentions</option>
            </select>

            {/* Speaker Selector (User vs Co-Human) */}
            {participants.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSpeakerMenu(!showSpeakerMenu)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5 text-[11px] transition-colors"
                >
                  <span>{currentSpeaker?.avatar}</span>
                  <span className="font-medium truncate max-w-[80px]">
                    {currentSpeaker?.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showSpeakerMenu && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 rounded-xl glass-panel-elevated shadow-2xl py-1.5 z-30">
                    <div className="px-3 py-1 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                      Speak As:
                    </div>
                    {participants.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSpeakerChange(p.id);
                          setShowSpeakerMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                          p.id === currentSpeakerId
                            ? "bg-indigo-500/20 text-indigo-300 font-semibold"
                            : "hover:bg-white/5 text-slate-300"
                        }`}
                      >
                        <span>{p.avatar}</span>
                        <span>{p.name}</span>
                        {p.isUser && (
                          <span className="text-[10px] text-slate-500 ml-auto">
                            (You)
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input Text Box & Action Buttons */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2.5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-lg shadow-black/40"
        >
          <textarea
            id="chat-message-input"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Query the collective or message ${agents.map((a) => a.name.split(" ")[0]).join(", ")}...`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 max-h-40 min-h-[44px] bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2.5 py-2.5 leading-relaxed"
          />

          <div className="flex items-center gap-2 pb-1 pr-1 flex-shrink-0">
            {isStreaming ? (
              <button
                id="stop-generation-btn"
                type="button"
                onClick={onStopStreaming}
                className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all active-indicator"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                id="send-message-btn"
                type="submit"
                disabled={!text.trim()}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold uppercase tracking-wider ${
                  text.trim()
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 active:scale-95"
                    : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                }`}
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
