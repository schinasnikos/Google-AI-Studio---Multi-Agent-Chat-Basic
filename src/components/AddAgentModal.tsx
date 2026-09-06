import React, { useState } from "react";
import { Agent } from "../types";
import { COLOR_THEMES, AVATAR_OPTIONS } from "../data/presets";
import { Bot, Plus, X } from "lucide-react";

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (newAgent: Agent) => void;
  existingCount: number;
}

export const AddAgentModal: React.FC<AddAgentModalProps> = ({
  isOpen,
  onClose,
  onAddAgent,
  existingCount,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(`Agent ${existingCount + 1}`);
  const [tagline, setTagline] = useState("Curious Observer");
  const [avatar, setAvatar] = useState(
    AVATAR_OPTIONS[existingCount % AVATAR_OPTIONS.length]
  );
  const [color, setColor] = useState(
    Object.keys(COLOR_THEMES)[existingCount % Object.keys(COLOR_THEMES).length]
  );
  const [prompt, setPrompt] = useState(
    `You are ${name}. Provide constructive, sharp, and thoughtful input. Challenge assumptions politely and spark deeper conversation.`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAgent: Agent = {
      id: `bot-${Date.now()}`,
      name: name.trim(),
      tagline: tagline.trim() || "AI Participant",
      avatar,
      color,
      prompt: prompt.trim(),
      isMuted: false,
      isTyping: false,
    };

    onAddAgent(newAgent);
    onClose();
  };

  const currentTheme = COLOR_THEMES[color] || COLOR_THEMES.indigo;

  return (
    <div
      id="add-agent-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        id="add-agent-modal-card"
        className="w-full max-w-lg bg-[#0a0a0f]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn backdrop-blur-2xl"
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 glow-indigo">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New AI Agent</h3>
              <p className="text-[11px] text-slate-400">
                Introduce another persona into the active chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leonardo da Vinci"
                required
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Short Archetype Tag
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Renaissance Polymath"
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Avatar & Color Theme
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-lg text-zinc-100 focus:outline-none"
              >
                {AVATAR_OPTIONS.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                {Object.entries(COLOR_THEMES).map(([k, t]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setColor(k)}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      color === k
                        ? "ring-2 ring-white scale-110 border-white"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: t.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Personality / System Prompt
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              placeholder="Define rules, tone, and character behavior..."
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Room</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
