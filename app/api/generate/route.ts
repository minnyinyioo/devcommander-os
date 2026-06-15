import { NextResponse } from "next/server";
import { generatePRD } from "../../../lib/engines/prd-engine";
import { generateArchitecture } from "../../../lib/engines/architecture-engine";
import { generateTasks } from "../../../lib/engines/task-engine";

export async function POST(request: Request) {
  const body = await request.json();
  const prompt = body.prompt || "";

  const brain = {
    projectId: crypto.randomUUID(),
    originalIdea: prompt,
    vision: `Turn this idea into a real product: ${prompt}`,
    targetUsers: [
      "Non-technical founder",
      "Solo builder",
      "Startup team",
      "Professional developer"
    ],
    principles: [
      "Security first",
      "Maintainable architecture",
      "Scalable by design",
      "No prompt-only product",
      "Real deployable software"
    ],
    flow: ["PRD", "Architecture", "Tasks", "Code", "Test", "Deploy", "Monitor"]
  };

  return NextResponse.json({
    projectId: brain.projectId,
    brain,
    prd: generatePRD(prompt),
    architecture: generateArchitecture(prompt),
    tasks: generateTasks(prompt)
  });
}