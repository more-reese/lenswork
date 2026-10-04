/**
 * Real LLM provider (server-side only). Uses the Anthropic SDK with
 * structured outputs (zodOutputFormat + messages.parse) so responses are
 * grammar-constrained to the schema, plus a one-shot repair retry for
 * anything that still fails validation or referential integrity.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import {
  CaseModelSchema,
  SynthesisSchema,
  diagramIntegrityErrors,
  lensAnalysisSchemaFor,
  type CaseInput,
  type CaseModel,
  type Depth,
  type LensAnalysis,
  type LensId,
  type Synthesis,
} from "@/lib/schema";
import type { LLMProvider, RefineResult, StageOptions } from "@/lib/llm/provider";
import { ProviderError } from "@/lib/llm/provider";
import {
  lensPrompts,
  normalizePrompts,
  refineNote,
  refinePrompts,
  repairSuffix,
  synthesisPrompts,
} from "@/lib/llm/prompts";

const EFFORT_BY_DEPTH: Record<Depth, "low" | "medium" | "high"> = {
  quick: "low",
  standard: "medium",
  deep: "high",
};

const MAX_TOKENS_BY_DEPTH: Record<Depth, number> = {
  quick: 8000,
  standard: 16000,
  deep: 16000,
};

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function toProviderError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  if (err instanceof Anthropic.AuthenticationError) {
    return new ProviderError("Invalid or missing API key.", "auth", false);
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new ProviderError(
      "Rate limited by the API. Wait a moment and retry this lens.",
      "rate_limit",
      true
    );
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return new ProviderError("Network error reaching the API.", "network", true);
  }
  if (err instanceof Anthropic.APIError) {
    const status = err.status ?? 0;
    return new ProviderError(
      `API error (${status}): ${err.message}`,
      status >= 500 ? "network" : "unknown",
      status >= 500
    );
  }
  return new ProviderError(
    err instanceof Error ? err.message : "Unknown provider error.",
    "unknown",
    false
  );
}

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic" as const;
  private client: Anthropic;

  constructor() {
    // Reads ANTHROPIC_API_KEY from the environment; never reaches the client bundle.
    // User-level keys (sk-ant-usr-…) aren't tied to a workspace and need the
    // workspace id sent as a header; workspace-scoped keys don't.
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
    this.client = new Anthropic(
      workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : undefined
    );
  }

  /**
   * One structured-output call with validation and a single repair retry.
   * `integrityCheck` lets callers add referential checks beyond shape.
   */
  private async callStructured<S extends z.ZodType>(
    schema: S,
    system: string,
    user: string,
    opts: StageOptions,
    integrityCheck?: (value: z.infer<S>) => string[]
  ): Promise<z.infer<S>> {
    const attempt = async (userContent: string): Promise<{ value?: z.infer<S>; errors: string }> => {
      const response = await this.client.messages.parse({
        model: opts.model,
        max_tokens: MAX_TOKENS_BY_DEPTH[opts.depth],
        system,
        messages: [{ role: "user", content: userContent }],
        output_config: {
          format: zodOutputFormat(schema),
          effort: EFFORT_BY_DEPTH[opts.depth],
        },
      });

      if (response.stop_reason === "refusal") {
        throw new ProviderError(
          "The model declined this request (safety refusal). Rephrase the case material and retry.",
          "unknown",
          false
        );
      }
      if (response.stop_reason === "max_tokens") {
        return { errors: "Response was truncated (max_tokens). Produce a more compact but complete output." };
      }
      const parsed = response.parsed_output;
      if (parsed == null) {
        return { errors: "Output did not parse against the schema. Produce complete, valid JSON for the schema." };
      }
      const validated = schema.safeParse(parsed);
      if (!validated.success) {
        return { errors: validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n") };
      }
      const integrity = integrityCheck?.(validated.data) ?? [];
      if (integrity.length > 0) {
        return { errors: integrity.join("\n") };
      }
      return { value: validated.data, errors: "" };
    };

    try {
      const first = await attempt(user);
      if (first.value !== undefined) return first.value;
      // One repair retry with the validation errors in context.
      const second = await attempt(user + repairSuffix(first.errors));
      if (second.value !== undefined) return second.value;
      throw new ProviderError(
        `Model output failed validation twice. Last errors:\n${second.errors}`,
        "invalid_output",
        true
      );
    } catch (err) {
      throw toProviderError(err);
    }
  }

  async normalize(input: CaseInput, opts: StageOptions): Promise<CaseModel> {
    const { system, user } = normalizePrompts(input);
    return this.callStructured(CaseModelSchema, system, user, opts);
  }

  async analyzeLens(lens: LensId, caseModel: CaseModel, opts: StageOptions): Promise<LensAnalysis> {
    const { system, user } = lensPrompts(lens, caseModel, opts.depth);
    const schema = lensAnalysisSchemaFor(lens);
    return this.callStructured(schema, system, user, opts, (a) =>
      diagramIntegrityErrors(a as LensAnalysis)
    );
  }

  async synthesize(
    caseModel: CaseModel,
    analyses: Partial<Record<LensId, LensAnalysis>>,
    opts: StageOptions
  ): Promise<Synthesis> {
    const { system, user } = synthesisPrompts(caseModel, analyses);
    return this.callStructured(SynthesisSchema, system, user, opts);
  }

  async refineLens(
    lens: LensId,
    caseModel: CaseModel,
    current: LensAnalysis,
    message: string,
    opts: StageOptions
  ): Promise<RefineResult> {
    const { system, user } = refinePrompts(lens, caseModel, current, message);
    const schema = lensAnalysisSchemaFor(lens);
    const analysis = await this.callStructured(schema, system, user, opts, (a) =>
      diagramIntegrityErrors(a as LensAnalysis)
    );
    return { analysis: analysis as LensAnalysis, note: refineNote(message) };
  }
}
