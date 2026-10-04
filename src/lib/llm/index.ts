/**
 * Provider selection. Real provider when ANTHROPIC_API_KEY is present,
 * deterministic mock otherwise (or when explicitly requested / forced).
 */
import type { LLMProvider } from "@/lib/llm/provider";
import { MockProvider } from "@/lib/llm/mock";
import { AnthropicProvider, hasApiKey } from "@/lib/llm/anthropic";

let anthropicSingleton: AnthropicProvider | undefined;
const mockSingleton = new MockProvider();

export type ProviderChoice = "auto" | "anthropic" | "mock";

export function providerAvailable(): { anthropic: boolean } {
  return { anthropic: hasApiKey() && process.env.LENSWORK_FORCE_MOCK !== "1" };
}

export function getProvider(choice: ProviderChoice = "auto"): LLMProvider {
  const real = providerAvailable().anthropic;
  if (choice === "mock" || !real) return mockSingleton;
  anthropicSingleton ??= new AnthropicProvider();
  return anthropicSingleton;
}
