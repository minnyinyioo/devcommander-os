import { NextResponse } from "next/server";
import type {
  AiCodeGenerationErrorResponse,
  AiCodeGenerationRequest,
} from "@/lib/ai-codegen/codegen-api-types";
import { generateCodeFromRequest } from "@/lib/ai-codegen/server-codegen";

export const dynamic = "force-dynamic";

function errorResponse(
  status: number,
  message: string,
): NextResponse<AiCodeGenerationErrorResponse> {
  return NextResponse.json(
    {
      error: "AI_CODE_GENERATION_ERROR",
      message,
    },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AiCodeGenerationRequest>;

    if (typeof body.prompt !== "string" || body.prompt.trim().length < 8) {
      return errorResponse(400, "Prompt must be at least 8 characters.");
    }

    if (
      body.provider !== undefined &&
      body.provider !== "local" &&
      body.provider !== "openai"
    ) {
      return errorResponse(400, "Unsupported provider.");
    }

    const result = await generateCodeFromRequest({
      prompt: body.prompt,
      projectId: typeof body.projectId === "string" ? body.projectId : undefined,
      provider: body.provider,
      maxFiles: typeof body.maxFiles === "number" ? body.maxFiles : undefined,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate code package.";

    return errorResponse(500, message);
  }
}
