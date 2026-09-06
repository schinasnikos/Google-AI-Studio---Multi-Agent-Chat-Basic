import React from "react";
import { Agent, OrchestrationMode } from "../types";
import { COLOR_THEMES } from "../data/presets";
import {
  Sliders,
  Sparkles,
  Layers,
  Flame,
  Plus,
  Info,
  ChevronRight,
  X,
  Bot,
  Settings,
} from "lucide-react";

interface RightConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  inspectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onInspectDetails: (agent: Agent) => void;
  orchestrationMode: OrchestrationMode;
  onModeChange: (mode: OrchestrationMode) => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  samplePrompts: string[];
  onSelectPromptStarter: (prompt: string) => void;
  onAddBotClick: () => void;
  onReconfigureClick: () => void;
}

export const RightConfigPanel: React.FC<RightConfigPanelProps> = ({
  isOpen,
  onClose,
  agents,
  inspectedAgent,
  onSelectAgent,
  onInspectDetails,
  orchestrationMode,
  onModeChange,
  temperature,
  onTemperatureChange,
  samplePrompts,
  onSelectPromptStarter,
  onAddBotClick,
  onReconfigureClick,
}) => {
  if (!isOpen) return null;

  // Selected agent to highlight in inspector (or first active agent)
  const currentAgent =
    inspectedAgent || (agents.length > 0 ? agents[0] : null);
  const currentTheme = currentAgent
    ? COLOR_THEMES[currentAgent.color] || COLOR_THEMES.indigo
    : COLOR_THEMES.indigo;

  return (
    <aside
      id="right-config-panel"
      className="w-72 lg:w-80 bg-[#07070a] border-l border-white/5 flex flex-col p-5 overflow-y-auto shrink-0 z-20 space-y-6 select-none"
    >
      {/* Panel Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Agent Configuration
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Focused Persona Card */}
      {currentAgent && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Active Persona
            </span>
            <span
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${currentTheme.badge}`}
            >
              {currentTheme.name}
            </span>
          </div>

          <div
            className={`p-4 rounded-xl border ${currentTheme.bgCard} ${currentTheme.border} relative overflow-hidden transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border ${currentTheme.border} ${currentTheme.bgSubtle} ${currentTheme.text}`}
                >
                  {currentAgent.avatar}
                </div>
                {!currentAgent.isMuted && (
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${currentTheme.dot} absolute bottom-0 right-0 border-2 border-[#07070a] active-indicator`}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-white truncate">
                    {currentAgent.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => onInspectDetails(currentAgent)}
                    title="Edit system prompt"
                    className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-white/10"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className={`text-[10px] uppercase font-semibold tracking-wider ${currentTheme.text} truncate`}>
                  {currentAgent.tagline || "Active Agent"}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                {currentAgent.prompt}
              </p>
            </div>
          </div>

          {/* Quick switcher tabs between all active agents */}
          {agents.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {agents.map((agent) => {
                const isSelected = agent.id === currentAgent.id;
                const aTheme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => onSelectAgent(agent)}
                    title={agent.name}
                    className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 border transition-all ${
                      isSelected
                        ? "bg-white/10 text-white border-white/20"
                        : "bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <span>{agent.avatar}</span>
                    <span className="text-[10px] font-medium max-w-[60px] truncate">
                      {agent.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Orchestration Mode Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>Turn Orchestration</span>
          </span>
          <span className="text-[10px] text-indigo-400 uppercase font-semibold">
            {orchestrationMode}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => onModeChange("sequential")}
            className={`py-1.5 px-2 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
              orchestrationMode === "sequential"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
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
          >
            @Mentions
          </button>
        </div>

        <p className="text-[10px] text-slate-500 leading-normal">
          {orchestrationMode === "sequential" &&
            "Agents respond in turn, building and debating previous points."}
          {orchestrationMode === "parallel" &&
            "All active agents process and stream simultaneously."}
          {orchestrationMode === "mentions" &&
            "Only agents targeted via @AgentName in the prompt respond."}
        </p>
      </div>

      {/* Temperature Slider */}
      <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 text-[11px]">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Creativity</span>
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
          <span>0.3 Precise</span>
          <span>0.7 Balanced</span>
          <span>1.1 Expressive</span>
        </div>
      </div>

      {/* Sample Kickoff Questions */}
      {samplePrompts.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Discussion Kickoffs</span>
          </span>

          <div className="space-y-1.5">
            {samplePrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPromptStarter(prompt)}
                className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 text-xs text-slate-300 transition-all flex items-center justify-between group"
              >
                <span className="line-clamp-2 text-[11px]">{prompt}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="pt-2 space-y-2">
        {agents.length < 5 && (
          <button
            type="button"
            onClick={onAddBotClick}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Spawn New Agent</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReconfigureClick}
          className="w-full py-2.5 px-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Studio Presets</span>
        </button>
      </div>
    </aside>
  );
};
