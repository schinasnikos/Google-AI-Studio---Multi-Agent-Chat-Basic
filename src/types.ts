export type SenderType = "user" | "bot" | "human";

export type OrchestrationMode = "sequential" | "parallel" | "mentions";

export interface Agent {
  id: string;
  name: string;
  prompt: string;
  avatar: string; // emoji or icon key
  color: string;  // color scheme key: 'emerald' | 'violet' | 'amber' | 'cyan' | 'rose' | 'sky' | 'indigo' | 'fuchsia'
  tagline?: string;
  isMuted?: boolean;
  isTyping?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isUser: boolean;
  color: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: SenderType;
  botId?: string;
  color?: string;
  avatar?: string;
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  replyToId?: string;
  error?: boolean;
}

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  bots: Array<{
    name: string;
    prompt: string;
    avatar: string;
    color: string;
    tagline: string;
  }>;
  samplePrompts: string[];
}
