import React from "react";
import { Agent, OrchestrationMode, Participant } from "../types";
import { COLOR_THEMES } from "../data/presets";
import {
  Bot,
  Users,
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Sliders,
  Flame,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  agents: Agent[];
  participants: Participant[];
  currentSpeakerId: string;
  onSpeakerChange: (id: string) => void;
  onToggleMuteBot: (botId: string) => void;
  onInspectBot: (bot: Agent) => void;
  onAddBotClick: () => void;
  onReconfigureClick: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onSelectPromptStarter: (prompt: string) => void;
  samplePrompts?: string[];
  temperature: number;
  onTemperatureChange: (val: number) => void;
  orchestrationMode: OrchestrationMode;
  onModeChange: (mode: OrchestrationMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  agents,
  participants,
  currentSpeakerId,
  onSpeakerChange,
  onToggleMuteBot,
  onInspectBot,
  onAddBotClick,
  onReconfigureClick,
  onClearChat,
  onExportChat,
  onSelectPromptStarter,
  samplePrompts = [],
  temperature,
  onTemperatureChange,
  orchestrationMode,
  onModeChange,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        id="chat-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-[#07070a] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 glow-indigo">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white">Participants</h3>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">
                {agents.length} Agents • {participants.length} Humans
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onReconfigureClick}
              title="Configure Agents & Presets"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Active AI Agents List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>Agents</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5 font-semibold">
                  {agents.filter((a) => !a.isMuted).length} Active
                </span>
                {agents.length < 5 && (
                  <button
                    type="button"
                    onClick={onAddBotClick}
                    className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {agents.map((agent) => {
                const theme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;
                return (
                  <div
                    key={agent.id}
                    id={`sidebar-bot-${agent.id}`}
                    className={`group p-3 rounded-xl border transition-all ${
                      agent.isMuted
                        ? "bg-white/[0.01] border-white/5 opacity-50"
                        : `${theme.bgCard} ${theme.border} hover:border-white/20`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${theme.border} ${theme.bgSubtle} ${theme.text}`}
                          >
                            {agent.avatar}
                          </div>
                          {!agent.isMuted && (
                            <div
                              className={`w-2 h-2 rounded-full ${theme.dot} absolute bottom-0 right-0 border-2 border-[#07070a] active-indicator`}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white truncate">
                              {agent.name}
                            </h4>
                            {agent.isTyping && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            )}
                          </div>
                          <p className={`text-[10px] uppercase font-semibold tracking-wider truncate opacity-70 ${theme.text}`}>
                            {agent.tagline || "Agent Persona"}
                          </p>
                        </div>
                      </div>

                      {/* Bot actions */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onInspectBot(agent)}
                          title="Inspect system prompt"
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleMuteBot(agent.id)}
                          title={agent.isMuted ? "Unmute Bot" : "Mute Bot"}
                          className={`p-1 rounded transition-colors ${
                            agent.isMuted
                              ? "text-rose-400 hover:bg-rose-500/20"
                              : "text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {agent.isMuted ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Human Participants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Humans</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {participants.map((p) => {
                const isActiveSpeaker = p.id === currentSpeakerId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSpeakerChange(p.id)}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isActiveSpeaker
                        ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-200"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{p.avatar}</span>
                      <span className="text-xs font-medium">
                        {p.name} {p.isUser ? "(You)" : ""}
                      </span>
                    </div>

                    {isActiveSpeaker ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                        Speaking
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-wider">
                        Switch
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orchestration Strategy Selector */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Turn Strategy</span>
            </span>

            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => onModeChange("sequential")}
                className={`py-1.5 px-2 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
                  orchestrationMode === "sequential"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Bots take turns one after another"
              >
                Sequential
              </button>
              <button
                type="button"
                onClick={() => onModeChange("parallel")}
                className={`py-1.5 px-2 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
                  orchestrationMode === "parallel"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Bots generate responses simultaneously"
              >
                Parallel
              </button>
              <button
                type="button"
                onClick={() => onModeChange("mentions")}
                className={`py-1.5 px-2 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
                  orchestrationMode === "mentions"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Only @mentioned bots respond"
              >
                @Mentions
              </button>
            </div>
          </div>

          {/* Creativity / Temperature Slider */}
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Creativity Temp</span>
              </span>
              <span className="font-mono text-amber-400 text-xs font-bold">
                {temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.1"
              step="0.1"
              value={temperature}
              onChange={(e) => onTemperatureChange(Number(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-slate-500">
              <span>Grounded</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Sample Prompts / Discussion Starters */}
          {samplePrompts.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Discussion Starters</span>
              </span>

              <div className="space-y-1.5">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPromptStarter(prompt)}
                    className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 text-xs text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span className="line-clamp-2">{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 flex-shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-white/5 bg-[#050508] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClearChat}
            className="flex-1 py-2 px-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            title="Clear current transcript"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={onExportChat}
            className="flex-1 py-2 px-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            title="Download transcript as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </aside>
    </>
  );
};
