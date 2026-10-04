/**
 * File-backed case store (server only). Each case is one JSON document in
 * data/cases/<id>.json — portable, greppable, no database to corrupt.
 * Writes are atomic (tmp + rename) so a crash never truncates a case.
 */
import { promises as fs } from "fs";
import path from "path";
import { CaseFileSchema, type CaseFile } from "@/lib/schema";

const DATA_DIR = path.join(process.cwd(), "data", "cases");

export interface CaseSummary {
  id: string;
  title: string;
  centralQuestion: string;
  updatedAt: string;
  createdAt: string;
  isSample: boolean;
  lensesDone: number;
  hasSynthesis: boolean;
  /** Present when the stored file failed validation and needs attention. */
  corrupt?: boolean;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function fileFor(id: string): string {
  // Defensive: ids are generated server-side, but never allow path traversal.
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error(`Invalid case id: ${id}`);
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listCases(): Promise<CaseSummary[]> {
  await ensureDir();
  const files = (await fs.readdir(DATA_DIR)).filter((f) => f.endsWith(".json"));
  const summaries: CaseSummary[] = [];
  for (const f of files) {
    const id = f.replace(/\.json$/, "");
    try {
      const raw = JSON.parse(await fs.readFile(path.join(DATA_DIR, f), "utf-8"));
      const parsed = CaseFileSchema.parse(raw);
      summaries.push({
        id: parsed.id,
        title: parsed.input.title,
        centralQuestion: parsed.input.centralQuestion,
        updatedAt: parsed.updatedAt,
        createdAt: parsed.createdAt,
        isSample: parsed.isSample,
        lensesDone: Object.values(parsed.analyses).filter((a) => a.status === "done").length,
        hasSynthesis: parsed.synthesis?.status === "done",
      });
    } catch {
      summaries.push({
        id,
        title: `(unreadable case: ${f})`,
        centralQuestion: "",
        updatedAt: "",
        createdAt: "",
        isSample: false,
        lensesDone: 0,
        hasSynthesis: false,
        corrupt: true,
      });
    }
  }
  summaries.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return summaries;
}

export async function readCase(id: string): Promise<CaseFile | undefined> {
  await ensureDir();
  try {
    const raw = JSON.parse(await fs.readFile(fileFor(id), "utf-8"));
    return CaseFileSchema.parse(raw);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw err;
  }
}

export async function writeCase(file: CaseFile): Promise<void> {
  await ensureDir();
  const validated = CaseFileSchema.parse(file);
  const target = fileFor(validated.id);
  const tmp = `${target}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(validated, null, 2), "utf-8");
  await fs.rename(tmp, target);
}

export async function deleteCase(id: string): Promise<boolean> {
  try {
    await fs.unlink(fileFor(id));
    return true;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Per-case write serialization: eight parallel lens requests all read-modify-
// write the same JSON document; a per-id promise chain prevents lost updates.
// ---------------------------------------------------------------------------
const locks = new Map<string, Promise<unknown>>();

export async function withCaseLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(id) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  const tail = run.catch(() => undefined);
  locks.set(id, tail);
  try {
    return await run;
  } finally {
    if (locks.get(id) === tail) locks.delete(id);
  }
}

export function newCaseId(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8);
  return `case-${stamp}-${rand}`;
}
