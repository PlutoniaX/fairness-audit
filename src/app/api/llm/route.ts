import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { PROVIDERS } from '@/lib/llm/provider-config';
import type { LLMProvider } from '@/types/llm';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('X-LLM-API-Key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { provider, systemPrompt, userPrompt } = body as {
      provider: LLMProvider;
      systemPrompt: string;
      userPrompt: string;
    };

    if (!provider || !systemPrompt || !userPrompt) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const config = PROVIDERS[provider];
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown provider: ${provider}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const model = createModel(provider, apiKey, config.model);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      maxTokens: 4096,
      temperature: 0.3,
    });

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function createModel(provider: LLMProvider, apiKey: string, modelId: string) {
  switch (provider) {
    case 'gemini': {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }
    case 'claude': {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(modelId);
    }
    case 'openai': {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
