import React from "react";
import { Agent } from "../types";
import { COLOR_THEMES } from "../data/presets";

interface TypingIndicatorProps {
  typingAgents: Agent[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingAgents,
}) => {
  if (!typingAgents || typingAgents.length === 0) return null;

  return (
    <div
      id="typing-indicators-container"
      className="flex flex-col gap-2 py-2 px-1 max-w-lg transition-all animate-fadeIn"
    >
      {typingAgents.map((agent) => {
        const theme = COLOR_THEMES[agent.color] || COLOR_THEMES.indigo;
        return (
          <div
            key={agent.id}
            id={`typing-indicator-${agent.id}`}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel ${theme.border} ${theme.glow} transition-all`}
          >
            {/* Bot Avatar with glow */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${theme.border} ${theme.bgSubtle} ${theme.text}`}
            >
              <span>{agent.avatar}</span>
            </div>

            {/* Status text */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className={`text-xs font-bold ${theme.text}`}>
                {agent.name}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                is weaving ideas...
              </span>
            </div>

            {/* 3 bouncing dots */}
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-bounce`}
                style={{ animationDelay: "0ms" }}
              />
              <div
                className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-bounce`}
                style={{ animationDelay: "150ms" }}
              />
              <div
                className={`w-1.5 h-1.5 rounded-full ${theme.dot} animate-bounce`}
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
