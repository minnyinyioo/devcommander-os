import { NextResponse } from "next/server";
import { getAiProviderStatus } from "@/lib/ai-provider/server-provider-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getAiProviderStatus();

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
