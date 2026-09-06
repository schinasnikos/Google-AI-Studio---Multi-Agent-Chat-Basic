import React from "react";
import {
  MessageSquare,
  Users,
  Sliders,
  Sparkles,
  Layers,
  Download,
  Trash2,
} from "lucide-react";

interface NavRailProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isConfigOpen: boolean;
  onToggleConfig: () => void;
  onOpenSetup: () => void;
  onExport: () => void;
  onClear: () => void;
}

export const NavRail: React.FC<NavRailProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  isConfigOpen,
  onToggleConfig,
  onOpenSetup,
  onExport,
  onClear,
}) => {
  return (
    <aside
      id="nav-rail"
      className="w-16 bg-[#050508] border-r border-white/5 flex flex-col items-center py-5 justify-between shrink-0 z-30 hidden md:flex select-none"
    >
      {/* Top Stack */}
      <div className="flex flex-col items-center space-y-6">
        {/* Immersive UI Brand Glyph */}
        <div
          title="Multi-Agent Chat Studio"
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30 border border-indigo-400/30 cursor-pointer"
          onClick={onOpenSetup}
        >
          Σ
        </div>

        {/* Primary Navigation Rail Icons */}
        <nav className="flex flex-col space-y-3">
          <button
            type="button"
            id="nav-rail-chat-btn"
            title="Active Chat View"
            className="w-10 h-10 rounded-xl bg-white/5 text-indigo-400 flex items-center justify-center border border-indigo-500/30 transition-all glow-indigo"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="nav-rail-participants-btn"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Hide Participants Panel" : "Show Participants Panel"}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isSidebarOpen
                ? "bg-white/10 text-emerald-400 border border-emerald-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="nav-rail-config-btn"
            onClick={onToggleConfig}
            title={isConfigOpen ? "Hide Configuration Inspector" : "Show Configuration Inspector"}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isConfigOpen
                ? "bg-white/10 text-amber-400 border border-amber-500/30"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            }`}
          >
            <Layers className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="nav-rail-setup-modal-btn"
            onClick={onOpenSetup}
            title="Configure Agents & Presets"
            className="w-10 h-10 rounded-xl text-slate-500 hover:text-indigo-400 hover:bg-white/5 flex items-center justify-center transition-all"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </nav>
      </div>

      {/* Bottom Utility Stack */}
      <div className="flex flex-col items-center space-y-3">
        <button
          type="button"
          id="nav-rail-export-btn"
          onClick={onExport}
          title="Export Chat Transcript (Markdown)"
          className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 flex items-center justify-center transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          type="button"
          id="nav-rail-clear-btn"
          onClick={onClear}
          title="Clear Chat Stream"
          className="w-10 h-10 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
