import React, { useState } from "react";
import { Agent } from "../types";
import { COLOR_THEMES } from "../data/presets";
import { Info, Edit3, Save, X } from "lucide-react";

interface PromptInspectModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePrompt: (botId: string, newPrompt: string, newName?: string) => void;
}

export const PromptInspectModal: React.FC<PromptInspectModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSavePrompt,
}) => {
  if (!isOpen || !agent) return null;

  const [prompt, setPrompt] = useState(agent.prompt);
  const [name, setName] = useState(agent.name);
  const [isEditing, setIsEditing] = useState(false);

  const theme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;

  const handleSave = () => {
    onSavePrompt(agent.id, prompt, name);
    setIsEditing(false);
    onClose();
  };

  return (
    <div
      id="inspect-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        id="inspect-modal-card"
        className="w-full max-w-lg bg-[#0a0a0f]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border ${theme.badge}`}
            >
              {agent.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badge}`}>
                  {theme.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Agent Persona & System Instructions</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  System Instruction / Personality Prompt
                </label>
                <textarea
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Current System Instructions:
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {agent.prompt}
              </div>
              <div className="text-[11px] text-zinc-500">
                This prompt is passed along with the conversation history to Gemini whenever {agent.name} responds.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Instructions</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Prompt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
