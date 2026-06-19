import { NextResponse } from "next/server";
import { validateAiProviderKeys } from "@/lib/ai-provider/provider-validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const validation = validateAiProviderKeys();

  return NextResponse.json(validation, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
