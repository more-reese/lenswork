import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CaseFileSchema } from "@/lib/schema";
import { deleteCase, readCase, withCaseLock, writeCase } from "@/lib/storage";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const file = await readCase(id);
  if (!file) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  return NextResponse.json(file);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const body = CaseFileSchema.parse(await req.json());
    if (body.id !== id) {
      return NextResponse.json({ error: "Case id mismatch." }, { status: 400 });
    }
    const updated = await withCaseLock(id, async () => {
      const current = await readCase(id);
      if (!current) throw Object.assign(new Error("Case not found."), { status: 404 });
      const next = { ...body, updatedAt: new Date().toISOString() };
      await writeCase(next);
      return next;
    });
    return NextResponse.json(updated);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 400;
    const message =
      err instanceof z.ZodError
        ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
        : err instanceof Error
          ? err.message
          : "Failed to update case.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const removed = await deleteCase(id);
  if (!removed) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
