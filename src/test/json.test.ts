import { describe, expect, it } from "vitest";
import { extractJson, schemaForPrompt } from "@/lib/llm/json";
import { lensAnalysisSchemaFor } from "@/lib/schema";

describe("extractJson", () => {
  it("parses a bare object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips a markdown fence", () => {
    expect(extractJson('```json\n{"a":{"b":[1,2]}}\n```')).toEqual({ a: { b: [1, 2] } });
  });

  it("tolerates a sentence of preamble", () => {
    expect(extractJson('Here is the analysis: {"ok":true}')).toEqual({ ok: true });
  });

  it("keeps braces that appear inside strings", () => {
    expect(extractJson('{"t":"a } b { c"}')).toEqual({ t: "a } b { c" });
  });

  it("throws a descriptive error on empty, no-object, and malformed replies", () => {
    expect(() => extractJson("   ")).toThrow(/empty/);
    expect(() => extractJson("no json here")).toThrow(/no JSON object/);
    expect(() => extractJson('{"a":')).toThrow(/no JSON object|not valid JSON/);
    expect(() => extractJson('{"a": nope}')).toThrow(/not valid JSON/);
  });
});

describe("schemaForPrompt", () => {
  it("emits a JSON Schema pinned to the lens, without the $schema URI", () => {
    const json = JSON.parse(schemaForPrompt(lensAnalysisSchemaFor("causal")));
    expect(json.$schema).toBeUndefined();
    expect(json.type).toBe("object");
    expect(json.properties.lens.const ?? json.properties.lens.enum?.[0]).toBe("causal");
    expect(json.required).toContain("challenges");
  });
});
