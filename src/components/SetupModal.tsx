import React, { useState } from "react";
import { Agent, OrchestrationMode, Participant, PresetScenario } from "../types";
import { COLOR_THEMES, AVATAR_OPTIONS, PRESET_SCENARIOS } from "../data/presets";
import {
  Bot,
  Users,
  Sparkles,
  Sliders,
  Check,
  Plus,
  Trash2,
  Shuffle,
  Cpu,
  Layers,
  AtSign,
  Radio,
} from "lucide-react";

interface SetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onStartChat: (config: {
    agents: Agent[];
    participants: Participant[];
    mode: OrchestrationMode;
    roomTopic: string;
  }) => void;
  initialAgents?: Agent[];
  initialMode?: OrchestrationMode;
  initialTopic?: string;
  isReconfiguring?: boolean;
}

const DEFAULT_COLOR_KEYS = [
  "indigo",
  "emerald",
  "rose",
  "amber",
  "cyan",
  "violet",
  "sky",
  "fuchsia",
];

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  initialAgents,
  initialMode = "sequential",
  initialTopic = "Exploring Ideas & Perspectives",
  isReconfiguring = false,
}) => {
  const [numBots, setNumBots] = useState<number>(() => {
    return initialAgents && initialAgents.length > 0 ? initialAgents.length : 3;
  });

  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");

  // Manage bot configs
  const [agents, setAgents] = useState<Agent[]>(() => {
    if (initialAgents && initialAgents.length > 0) {
      return initialAgents;
    }
    const defaultPreset = PRESET_SCENARIOS[0];
    return defaultPreset.bots.map((b, idx) => ({
      id: `bot-${Date.now()}-${idx}`,
      name: b.name,
      prompt: b.prompt,
      avatar: b.avatar,
      color: b.color,
      tagline: b.tagline,
      isMuted: false,
      isTyping: false,
    }));
  });

  // Human participants
  const [userName, setUserName] = useState<string>("You");
  const [userAvatar, setUserAvatar] = useState<string>("👤");
  const [enableSecondHuman, setEnableSecondHuman] = useState<boolean>(false);
  const [secondHumanName, setSecondHumanName] = useState<string>("Sarah");
  const [secondHumanAvatar, setSecondHumanAvatar] = useState<string>("👩‍💻");

  const [orchestrationMode, setOrchestrationMode] =
    useState<OrchestrationMode>(initialMode);
  const [roomTopic, setRoomTopic] = useState<string>(initialTopic);

  if (!isOpen) return null;

  // Handle changing number of bots
  const handleBotCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(5, count));
    setNumBots(validCount);

    setAgents((prev) => {
      if (validCount === prev.length) return prev;
      if (validCount > prev.length) {
        const added: Agent[] = [];
        const defaultNames = ["Atlas", "Nova", "Cipher", "Zephyr", "Aegis"];
        for (let i = prev.length; i < validCount; i++) {
          const colorKey = DEFAULT_COLOR_KEYS[i % DEFAULT_COLOR_KEYS.length];
          const avatar = AVATAR_OPTIONS[i % AVATAR_OPTIONS.length];
          added.push({
            id: `bot-${Date.now()}-${i}`,
            name: defaultNames[i] || `Agent ${i + 1}`,
            prompt: `You are ${
              defaultNames[i] || `Agent ${i + 1}`
            }, an insightful contributor. Offer constructive, creative viewpoints with clear reasoning.`,
            avatar,
            color: colorKey,
            tagline: "Collaborative Thinker",
            isMuted: false,
            isTyping: false,
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, validCount);
      }
    });
  };

  const updateAgentField = (index: number, field: keyof Agent, value: any) => {
    setAgents((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const applyPreset = (preset: PresetScenario) => {
    const newBots: Agent[] = preset.bots.map((b, idx) => ({
      id: `bot-${Date.now()}-${idx}`,
      name: b.name,
      prompt: b.prompt,
      avatar: b.avatar,
      color: b.color,
      tagline: b.tagline,
      isMuted: false,
      isTyping: false,
    }));
    setNumBots(newBots.length);
    setAgents(newBots);
    setRoomTopic(preset.title);
  };

  const handleLaunch = () => {
    const finalParticipants: Participant[] = [
      {
        id: "user-primary",
        name: userName.trim() || "You",
        avatar: userAvatar,
        isUser: true,
        color: "indigo",
      },
    ];

    if (enableSecondHuman) {
      finalParticipants.push({
        id: "human-co-participant",
        name: secondHumanName.trim() || "Participant 2",
        avatar: secondHumanAvatar,
        isUser: false,
        color: "cyan",
      });
    }

    onStartChat({
      agents: agents.slice(0, numBots),
      participants: finalParticipants,
      mode: orchestrationMode,
      roomTopic: roomTopic.trim() || "Group Discussion",
    });
  };

  return (
    <div
      id="setup-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="setup-modal-dialog"
        className="w-full max-w-4xl bg-[#0a0a0f]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.03] via-transparent to-white/[0.02] flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Multi-Agent Chat Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isReconfiguring ? "Configure Chat Environment" : "Setup Multi-Agent Chat"}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configure 1 to 5 AI agents with tailored personas and colors to converse
              collaboratively alongside human participants.
            </p>
          </div>
          {onClose && (
            <button
              id="close-setup-modal-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
              aria-label="Close setup modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-7">
          {/* Preset scenarios bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Quick Scenario Presets</span>
              </label>
              <span className="text-xs text-zinc-500">
                Click any preset to pre-fill bots
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => applyPreset(scenario)}
                  className="text-left p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{scenario.icon}</span>
                      <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white">
                        {scenario.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    {scenario.bots.map((b, i) => (
                      <span
                        key={i}
                        className="text-xs px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono"
                      >
                        {b.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Number of AI Bots Slider / Selector */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span>Number of AI Bots (1 to 5)</span>
                </label>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select how many distinct agents will participate in the chat
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleBotCountChange(num)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      numBots === num
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-700/50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider bar for smooth tactile feel */}
            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center gap-3">
              <span className="text-xs text-zinc-500 font-medium">1 Bot</span>
              <input
                id="num-bots-slider"
                type="range"
                min="1"
                max="5"
                step="1"
                value={numBots}
                onChange={(e) => handleBotCountChange(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs text-zinc-500 font-medium">5 Bots</span>
            </div>
          </div>

          {/* Dynamic Bot Configuration Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Active Bot Configurations ({numBots})</span>
              </label>
              <span className="text-xs text-zinc-500">
                Define each agent's character, personality, avatar, and color
              </span>
            </div>

            <div className="space-y-4">
              {agents.slice(0, numBots).map((agent, index) => {
                const theme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;
                return (
                  <div
                    key={agent.id || index}
                    id={`bot-card-${index}`}
                    className={`p-4 sm:p-5 rounded-xl border transition-all bg-zinc-950/80 ${theme.border}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border ${theme.badge} shadow-sm`}
                        >
                          {agent.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                              Bot #{index + 1}
                            </span>
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${theme.badge}`}
                            >
                              {theme.name}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            {agent.name || `Bot ${index + 1}`}
                          </p>
                        </div>
                      </div>

                      {/* Avatar Quick Switcher */}
                      <div className="flex items-center gap-1">
                        {AVATAR_OPTIONS.slice(index * 3, index * 3 + 4).map(
                          (emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() =>
                                updateAgentField(index, "avatar", emoji)
                              }
                              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                                agent.avatar === emoji
                                  ? "bg-zinc-800 scale-110 ring-1 ring-zinc-500"
                                  : "hover:bg-zinc-800/60 opacity-60 hover:opacity-100"
                              }`}
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                      {/* Name input */}
                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">
                          Bot Name
                        </label>
                        <input
                          type="text"
                          value={agent.name}
                          onChange={(e) =>
                            updateAgentField(index, "name", e.target.value)
                          }
                          placeholder="e.g. Socrates, Tech Critic"
                          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />

                        {/* Color Selector */}
                        <div className="pt-2">
                          <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
                            Visual Theme Color
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(COLOR_THEMES).map(
                              ([key, colorTheme]) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() =>
                                    updateAgentField(index, "color", key)
                                  }
                                  title={colorTheme.name}
                                  className={`w-6 h-6 rounded-full border transition-all ${
                                    agent.color === key
                                      ? "ring-2 ring-white scale-110 border-white"
                                      : "border-transparent opacity-70 hover:opacity-100"
                                  }`}
                                  style={{ backgroundColor: colorTheme.hex }}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Prompt input */}
                      <div className="md:col-span-8 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-zinc-300">
                            Bot Character & System Prompt
                          </label>
                          <span className="text-[11px] text-zinc-500">
                            Tone, rules, background, and perspective
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={agent.prompt}
                          onChange={(e) =>
                            updateAgentField(index, "prompt", e.target.value)
                          }
                          placeholder="Define personality, manner of speaking, quirks, and stance..."
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Human Participants Section */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Human Participants</span>
                </label>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure your speaker profile and optionally invite a co-human participant
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary user */}
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Primary User (You)
                </div>
                <div className="flex items-center gap-2.5">
                  <select
                    value={userAvatar}
                    onChange={(e) => setUserAvatar(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-base text-zinc-200 focus:outline-none"
                  >
                    <option value="👤">👤</option>
                    <option value="👩‍💻">👩‍💻</option>
                    <option value="👨‍💻">👨‍💻</option>
                    <option value="🧑‍🚀">🧑‍🚀</option>
                    <option value="🧑‍🔬">🧑‍🔬</option>
                    <option value="🧙">🧙</option>
                  </select>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your Name (e.g. Alex)"
                    className="flex-1 px-3 py-1.5 text-sm bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              {/* Second human participant */}
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Co-Human Participant
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={enableSecondHuman}
                      onChange={(e) => setEnableSecondHuman(e.target.checked)}
                      className="rounded bg-zinc-800 border-zinc-700 text-indigo-500 focus:ring-0"
                    />
                    <span>Enable</span>
                  </label>
                </div>

                {enableSecondHuman ? (
                  <div className="flex items-center gap-2.5">
                    <select
                      value={secondHumanAvatar}
                      onChange={(e) => setSecondHumanAvatar(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-base text-zinc-200 focus:outline-none"
                    >
                      <option value="👩‍💻">👩‍💻</option>
                      <option value="👨‍💼">👨‍💼</option>
                      <option value="🧑‍🎨">🧑‍🎨</option>
                      <option value="🧑‍🎓">🧑‍🎓</option>
                    </select>
                    <input
                      type="text"
                      value={secondHumanName}
                      onChange={(e) => setSecondHumanName(e.target.value)}
                      placeholder="Name (e.g. Sarah)"
                      className="flex-1 px-3 py-1.5 text-sm bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-1.5">
                    Add another human persona to simulate multi-user group chat
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Orchestration Strategy selector */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <label className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Agent Orchestration Strategy</span>
            </label>
            <p className="text-xs text-zinc-400 mb-3.5">
              Choose how the AI bots take turns responding when a message is sent
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOrchestrationMode("sequential")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  orchestrationMode === "sequential"
                    ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      orchestrationMode === "sequential"
                        ? "bg-indigo-400"
                        : "bg-zinc-600"
                    }`}
                  />
                  <h4 className="text-sm font-semibold text-zinc-100">
                    Sequential Round-Robin
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">
                  Bot 1 streams, then Bot 2 streams while reading Bot 1's reply, creating authentic debate.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOrchestrationMode("parallel")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  orchestrationMode === "parallel"
                    ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      orchestrationMode === "parallel"
                        ? "bg-indigo-400"
                        : "bg-zinc-600"
                    }`}
                  />
                  <h4 className="text-sm font-semibold text-zinc-100">
                    Parallel Simultaneous
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">
                  All active bots begin typing concurrently, providing rapid multi-angle perspectives.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setOrchestrationMode("mentions")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  orchestrationMode === "mentions"
                    ? "border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      orchestrationMode === "mentions"
                        ? "bg-indigo-400"
                        : "bg-zinc-600"
                    }`}
                  />
                  <h4 className="text-sm font-semibold text-zinc-100">
                    @Mentions & Directing
                  </h4>
                </div>
                <p className="text-xs text-zinc-400">
                  Only mentioned bots respond (e.g. "@Socrates"). If "@all" or no mention, all reply in turn.
                </p>
              </button>
            </div>
          </div>

          {/* Discussion Topic / Room Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Room Topic / Discussion Theme
            </label>
            <input
              type="text"
              value={roomTopic}
              onChange={(e) => setRoomTopic(e.target.value)}
              placeholder="e.g. Philosophical Debate on AGI, Startup Pitch Evaluation"
              className="w-full px-3.5 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#050508] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 active-indicator" />
            <span>
              Ready to initialize room with <strong className="text-slate-200">{numBots} AI agents</strong> and{" "}
              <strong className="text-slate-200">{enableSecondHuman ? "2 humans" : "1 human"}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-300 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              id="start-chat-room-btn"
              type="button"
              onClick={handleLaunch}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-900/40 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isReconfiguring ? "Apply Changes" : "Start Conversation"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
