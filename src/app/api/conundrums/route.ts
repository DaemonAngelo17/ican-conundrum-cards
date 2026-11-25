import { NextRequest, NextResponse } from "next/server";
import {
  loadConundrumDataset,
  saveConundrumRecord,
} from "@/lib/sheets-loader";
import type { ConundrumFormPayload } from "@/types/conundrum";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const forceRefresh =
      request.nextUrl.searchParams.get("refresh") === "1" ||
      request.nextUrl.searchParams.get("refresh") === "true";

    const data = await loadConundrumDataset({ forceRefresh });
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load conundrum database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ConundrumFormPayload;
    const result = await saveConundrumRecord("create", payload);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create conundrum card";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = (await request.json()) as ConundrumFormPayload;
    const result = await saveConundrumRecord("update", payload);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update conundrum card";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
