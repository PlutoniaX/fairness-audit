export type LLMProvider = 'gemini' | 'claude' | 'openai';

export interface ProviderConfig {
  id: LLMProvider;
  name: string;
  model: string;
  packageName: string;
}

export interface LLMRequest {
  provider: LLMProvider;
  systemPrompt: string;
  userPrompt: string;
  component: string;
  section: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: LLMProvider;
}

export interface ChatSession {
  id: string;
  component: string;
  messages: ChatMessage[];
  createdAt: number;
}
