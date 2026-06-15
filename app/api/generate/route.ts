import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    projectId: crypto.randomUUID(),
    input: body.prompt,
    brain: {
      vision: "Generated project vision",
      targetUsers: [],
      features: [],
      architecture: [],
      tasks: []
    },
    prd: "Generated PRD placeholder",
    architecture: "Generated Architecture placeholder",
    tasks: ["Create Project Brain", "Generate PRD", "Generate Architecture"]
  });
}
