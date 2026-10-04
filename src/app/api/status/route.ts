import { NextResponse } from "next/server";
import { providerAvailable } from "@/lib/llm";

/** Tells the client whether a real provider is configured (never the key itself). */
export async function GET() {
  return NextResponse.json({ anthropic: providerAvailable().anthropic });
}
