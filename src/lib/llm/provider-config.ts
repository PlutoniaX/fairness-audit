import type { ProviderConfig, LLMProvider } from '@/types/llm';

export const PROVIDERS: Record<LLMProvider, ProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    model: 'gemini-2.0-flash',
    packageName: '@ai-sdk/google',
  },
  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    model: 'claude-sonnet-4-5-20250929',
    packageName: '@ai-sdk/anthropic',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    model: 'gpt-4o',
    packageName: '@ai-sdk/openai',
  },
};

export function getProviderConfig(provider: LLMProvider): ProviderConfig {
  return PROVIDERS[provider];
}
