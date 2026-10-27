/**
 * Helpers for "JSON in the prompt" mode, used for schemas too large for the
 * API's constrained-decoding grammar (the lens, synthesis, and refine calls).
 * Shape is then enforced by Zod validation plus the repair retry instead.
 */
import { z } from "zod";

/** JSON Schema for the prompt, without the $schema URI noise. */
export function schemaForPrompt(schema: z.ZodType): string {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  return JSON.stringify(json);
}

/**
 * Pull the single JSON object out of a model reply, tolerating a stray
 * markdown fence or a sentence of preamble. Throws a descriptive Error.
 */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.length === 0) throw new Error("The reply was empty.");
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("The reply contained no JSON object.");
  try {
    return JSON.parse(unfenced.slice(start, end + 1));
  } catch (err) {
    throw new Error(`The reply was not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
}
