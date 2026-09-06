import React, { useState, useEffect, useRef, useCallback } from "react";
import { Agent, ChatMessage, OrchestrationMode, Participant } from "./types";
import { PRESET_SCENARIOS, COLOR_THEMES } from "./data/presets";
import { SetupModal } from "./components/SetupModal";
import { Sidebar } from "./components/Sidebar";
import { ChatMessageCard } from "./components/ChatMessageCard";
import { ChatInput } from "./components/ChatInput";
import { TypingIndicator } from "./components/TypingIndicator";
import { PromptInspectModal } from "./components/PromptInspectModal";
import { AddAgentModal } from "./components/AddAgentModal";
import { NavRail } from "./components/NavRail";
import { RightConfigPanel } from "./components/RightConfigPanel";
import {
  Menu,
  Sparkles,
  Sliders,
  RotateCcw,
  Bot,
  Users,
  MessageSquare,
  Share2,
  Layers,
} from "lucide-react";

export default function App() {
  // Session / Room Configuration
  const [roomTopic, setRoomTopic] = useState<string>("The Philosophical Salon");
  const [agents, setAgents] = useState<Agent[]>(() => {
    return PRESET_SCENARIOS[0].bots.map((b, idx) => ({
      id: `bot-init-${idx}`,
      name: b.name,
      prompt: b.prompt,
      avatar: b.avatar,
      color: b.color,
      tagline: b.tagline,
      isMuted: false,
      isTyping: false,
    }));
  });

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "user-primary",
      name: "You",
      avatar: "👤",
      isUser: true,
      color: "indigo",
    },
  ]);

  const [currentSpeakerId, setCurrentSpeakerId] = useState<string>("user-primary");
  const [orchestrationMode, setOrchestrationMode] =
    useState<OrchestrationMode>("sequential");
  const [temperature, setTemperature] = useState<number>(0.8);

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // UI state
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(true); // Open setup modal by default on first load as requested
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(true);
  const [inspectedAgent, setInspectedAgent] = useState<Agent | null>(null);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState<boolean>(false);

  // Streaming control
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages update
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Set initial sample discussion prompts
  const currentPreset =
    PRESET_SCENARIOS.find((p) => p.title === roomTopic) || PRESET_SCENARIOS[0];

  // Helper to start chat from setup modal
  const handleStartChat = (config: {
    agents: Agent[];
    participants: Participant[];
    mode: OrchestrationMode;
    roomTopic: string;
  }) => {
    setAgents(config.agents);
    setParticipants(config.participants);
    setOrchestrationMode(config.mode);
    setRoomTopic(config.roomTopic);
    setCurrentSpeakerId(config.participants[0]?.id || "user-primary");
    setIsSetupOpen(false);

    // If starting a fresh chat, clear previous messages or seed welcome
    setMessages([
      {
        id: `sys-welcome-${Date.now()}`,
        senderId: "system",
        senderName: "Studio System",
        senderType: "user",
        text: `**Room Initialized: ${config.roomTopic}**\n\nParticipating AI Agents: ${config.agents
          .map((a) => `**${a.name}**`)
          .join(", ")}.\n\nSend a prompt, ask a question, or use \`@mention\` to direct the discussion!`,
        timestamp: Date.now(),
      },
    ]);
  };

  // Helper to stream one bot's response
  const streamBotResponse = async (
    bot: Agent,
    currentHistory: ChatMessage[],
    signal: AbortSignal
  ): Promise<string> => {
    // Set bot typing state
    setAgents((prev) =>
      prev.map((a) => (a.id === bot.id ? { ...a, isTyping: true } : a))
    );

    const messageId = `bot-msg-${bot.id}-${Date.now()}`;
    let accumulatedText = "";

    // Add empty placeholder message for streaming
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        senderId: bot.id,
        senderName: bot.name,
        senderType: "bot",
        botId: bot.id,
        color: bot.color,
        avatar: bot.avatar,
        text: "",
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);

    try {
      const response = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bot,
          allBots: agents,
          messages: currentHistory,
          humanParticipants: participants,
          temperature,
        }),
        signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream received");

      const decoder = new TextDecoder();
      let buffer = "";
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            let data: any = null;
            try {
              data = JSON.parse(trimmed.slice(6));
            } catch {
              // Ignore partial JSON parse errors
              continue;
            }

            if (data?.error) {
              streamError = data.error;
              break;
            }

            if (data?.chunk) {
              accumulatedText += data.chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, text: accumulatedText } : m
                )
              );
            }
          }
        }

        if (streamError) {
          throw new Error(streamError);
        }
      }

      // Mark message finished streaming
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const finalText = accumulatedText.trim();
          if (!finalText) {
            return {
              ...m,
              text: `⚠️ *(${bot.name} could not generate a reply. The model may be experiencing high demand. Click "Retry response" below to try again.)*`,
              isStreaming: false,
              error: true,
            };
          }
          return {
            ...m,
            text: finalText,
            isStreaming: false,
          };
        })
      );
    } catch (err: any) {
      if (err.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: accumulatedText ? `${accumulatedText} *(stopped)*` : "*(Generation cancelled)*",
                  isStreaming: false,
                }
              : m
          )
        );
      } else {
        console.error(`Error streaming bot ${bot.name}:`, err);
        const errMsg = err?.message || "Service temporarily unavailable";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: accumulatedText
                    ? `${accumulatedText}\n\n⚠️ *(Stream interrupted: ${errMsg})*`
                    : `⚠️ *${bot.name} could not respond: ${errMsg}*`,
                  isStreaming: false,
                  error: true,
                }
              : m
          )
        );
      }
    } finally {
      // Clear bot typing state
      setAgents((prev) =>
        prev.map((a) => (a.id === bot.id ? { ...a, isTyping: false } : a))
      );
    }

    return accumulatedText;
  };

  // Retry an individual bot message that encountered an error
  const handleRetryMessage = async (failedMessage: ChatMessage) => {
    if (isGenerating) return;
    const bot = agents.find(
      (a) => a.id === failedMessage.senderId || a.id === failedMessage.botId
    );
    if (!bot) return;

    // Filter out the failed message from messages history
    const historyBefore = messages.filter((m) => m.id !== failedMessage.id);
    setMessages(historyBefore);

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamBotResponse(bot, historyBefore, controller.signal);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Main message sending and agent orchestration
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    // Identify current speaker
    const speaker =
      participants.find((p) => p.id === currentSpeakerId) || participants[0];

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: speaker.id,
      senderName: speaker.name,
      senderType: speaker.isUser ? "user" : "human",
      avatar: speaker.avatar,
      color: speaker.color,
      text: text.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);

    // Identify responding bots
    const activeBots = agents.filter((a) => !a.isMuted);
    if (activeBots.length === 0) return;

    let targetBots: Agent[] = [];

    if (orchestrationMode === "mentions") {
      const lower = text.toLowerCase();
      if (lower.includes("@all")) {
        targetBots = activeBots;
      } else {
        targetBots = activeBots.filter((b) =>
          lower.includes(`@${b.name.toLowerCase()}`)
        );
        // If no bot explicitly mentioned, default to all active bots
        if (targetBots.length === 0) {
          targetBots = activeBots;
        }
      }
    } else {
      targetBots = activeBots;
    }

    if (targetBots.length === 0) return;

    // Start generation
    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (orchestrationMode === "parallel") {
        // Run all bot streams concurrently with small stagger to prevent rate limit collisions
        await Promise.all(
          targetBots.map(
            (bot, idx) =>
              new Promise<void>((resolve) => {
                setTimeout(async () => {
                  try {
                    await streamBotResponse(bot, newHistory, controller.signal);
                  } finally {
                    resolve();
                  }
                }, idx * 150);
              })
          )
        );
      } else {
        // Sequential round-robin: Bot 1 replies, then Bot 2 replies with updated context, etc.
        let rollingHistory = [...newHistory];
        for (const bot of targetBots) {
          if (controller.signal.aborted) break;
          const botReply = await streamBotResponse(
            bot,
            rollingHistory,
            controller.signal
          );
          if (botReply) {
            rollingHistory.push({
              id: `bot-seq-${bot.id}-${Date.now()}`,
              senderId: bot.id,
              senderName: bot.name,
              senderType: "bot",
              botId: bot.id,
              color: bot.color,
              avatar: bot.avatar,
              text: botReply,
              timestamp: Date.now(),
            });
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Orchestration error:", err);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      setAgents((prev) => prev.map((a) => ({ ...a, isTyping: false })));
    }
  };

  // Bot management
  const handleToggleMute = (botId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === botId ? { ...a, isMuted: !a.isMuted } : a))
    );
  };

  const handleSavePrompt = (
    botId: string,
    newPrompt: string,
    newName?: string
  ) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === botId
          ? {
              ...a,
              prompt: newPrompt,
              ...(newName ? { name: newName } : {}),
            }
          : a
      )
    );
  };

  const handleAddAgent = (newAgent: Agent) => {
    setAgents((prev) => [...prev, newAgent]);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-agent-join-${Date.now()}`,
        senderId: "system",
        senderName: "System",
        senderType: "user",
        text: `🔔 **${newAgent.name}** (${newAgent.avatar}) has entered the discussion.`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleClearChat = () => {
    if (window.confirm("Clear the chat transcript? Active agents will be preserved.")) {
      setMessages([]);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const lines = [
      `# Multi-Agent Chat Transcript: ${roomTopic}`,
      `*Exported on ${new Date().toLocaleString()}*`,
      `*Active Agents: ${agents.map((a) => a.name).join(", ")}*`,
      "",
      "---",
      "",
    ];

    messages.forEach((m) => {
      const time = new Date(m.timestamp).toLocaleTimeString();
      lines.push(`### [${time}] ${m.senderName} (${m.senderType.toUpperCase()})`);
      lines.push(m.text);
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-transcript-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const typingAgents = agents.filter((a) => a.isTyping);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030305] text-slate-300 font-sans">
      {/* Setup Modal */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartChat={handleStartChat}
        initialAgents={agents}
        initialMode={orchestrationMode}
        initialTopic={roomTopic}
        isReconfiguring={messages.length > 0}
      />

      {/* Inspect / Edit Agent Prompt Modal */}
      <PromptInspectModal
        agent={inspectedAgent}
        isOpen={Boolean(inspectedAgent)}
        onClose={() => setInspectedAgent(null)}
        onSavePrompt={handleSavePrompt}
      />

      {/* Add Extra Agent Modal */}
      <AddAgentModal
        isOpen={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
        onAddAgent={handleAddAgent}
        existingCount={agents.length}
      />

      {/* Column 1: Navigation Rail (md+) */}
      <NavRail
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isConfigOpen={isConfigOpen}
        onToggleConfig={() => setIsConfigOpen(!isConfigOpen)}
        onOpenSetup={() => setIsSetupOpen(true)}
        onExport={handleExportChat}
        onClear={handleClearChat}
      />

      {/* Column 2: Participants & Agents Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        agents={agents}
        participants={participants}
        currentSpeakerId={currentSpeakerId}
        onSpeakerChange={setCurrentSpeakerId}
        onToggleMuteBot={handleToggleMute}
        onInspectBot={(bot) => setInspectedAgent(bot)}
        onAddBotClick={() => setIsAddAgentOpen(true)}
        onReconfigureClick={() => setIsSetupOpen(true)}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        onSelectPromptStarter={(p) => handleSendMessage(p)}
        samplePrompts={currentPreset.samplePrompts}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        orchestrationMode={orchestrationMode}
        onModeChange={setOrchestrationMode}
      />

      {/* Column 3: Main Chat Feed */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#030305] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0d0d18] via-[#050509] to-[#030305] relative">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-white/5 glass-panel flex items-center justify-between z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              aria-label="Toggle participants sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {roomTopic}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {orchestrationMode}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-medium hidden sm:block truncate">
                Orchestrated Multi-Agent Thread • {agents.length} Agents • {participants.length} Humans
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Active Agents Pills */}
            <div className="hidden lg:flex items-center gap-1.5 mr-1">
              {agents.map((agent) => {
                const theme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setInspectedAgent(agent)}
                    title={`${agent.name} (${agent.isMuted ? "Muted" : "Active"})`}
                    className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 border transition-all ${
                      agent.isMuted
                        ? "opacity-50 border-white/5 bg-white/[0.02]"
                        : `${theme.badge} ${agent.isTyping ? "ring-2 ring-emerald-400 animate-pulse" : ""}`
                    }`}
                  >
                    <span>{agent.avatar}</span>
                    <span className="max-w-[70px] truncate">{agent.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Toggle Configuration Panel (Col 4) */}
            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`p-2 rounded-xl border transition-colors hidden sm:flex items-center justify-center ${
                isConfigOpen
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                  : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title={isConfigOpen ? "Hide Configuration Panel" : "Open Configuration Panel"}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Configure Presets Modal */}
            <button
              type="button"
              onClick={() => setIsSetupOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 transition-colors"
              title="Reconfigure Agents & Environment"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Configure</span>
            </button>
          </div>
        </header>

        {/* Scrollable Message Feed */}
        <div
          id="messages-scroll-feed"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 msg-stream-mask"
        >
          {messages.length === 0 ? (
            /* Welcome Empty State */
            <div className="max-w-2xl mx-auto my-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto text-2xl shadow-xl shadow-indigo-600/20 glow-indigo">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Welcome to {roomTopic}
                </h2>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Start conversing with your configured AI agents. They are primed to respond
                  in character, debate, synthesize ideas, and collaborate with you.
                </p>
              </div>

              {/* Agent Lineup Showcase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto">
                {agents.map((agent) => {
                  const theme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;
                  return (
                    <div
                      key={agent.id}
                      className={`p-3.5 rounded-xl border ${theme.bgCard} ${theme.border} space-y-1`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{agent.avatar}</span>
                        <span className="text-xs font-bold text-white truncate">
                          {agent.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {agent.prompt}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Kickoff Prompts */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2.5">
                  Try asking a question to kick off the debate:
                </span>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {currentPreset.samplePrompts.slice(0, 2).map((sp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(sp)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/10 hover:border-white/10 text-slate-300 text-left transition-colors"
                    >
                      "{sp}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Message List */
            <div className="max-w-4xl mx-auto space-y-3">
              {messages.map((message) => (
                <ChatMessageCard
                  key={message.id}
                  message={message}
                  onRetry={handleRetryMessage}
                  onMentionOrReply={(name) => {
                    const input = document.getElementById(
                      "chat-message-input"
                    ) as HTMLTextAreaElement | null;
                    if (input) {
                      const tag = `@${name} `;
                      input.value = input.value ? `${input.value} ${tag}` : tag;
                      input.focus();
                    }
                  }}
                />
              ))}

              {/* Typing Indicators */}
              <TypingIndicator typingAgents={typingAgents} />

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <ChatInput
          agents={agents.filter((a) => !a.isMuted)}
          participants={participants}
          currentSpeakerId={currentSpeakerId}
          onSpeakerChange={setCurrentSpeakerId}
          onSendMessage={handleSendMessage}
          isStreaming={isGenerating}
          onStopStreaming={handleStopStreaming}
          orchestrationMode={orchestrationMode}
          onModeChange={setOrchestrationMode}
        />
      </main>

      {/* Column 4: Right Sidebar: Configuration Panel */}
      <RightConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        agents={agents}
        inspectedAgent={inspectedAgent}
        onSelectAgent={(agent) => setInspectedAgent(agent)}
        onInspectDetails={(agent) => setInspectedAgent(agent)}
        orchestrationMode={orchestrationMode}
        onModeChange={setOrchestrationMode}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        samplePrompts={currentPreset.samplePrompts}
        onSelectPromptStarter={(p) => handleSendMessage(p)}
        onAddBotClick={() => setIsAddAgentOpen(true)}
        onReconfigureClick={() => setIsSetupOpen(true)}
      />
    </div>
  );
}
