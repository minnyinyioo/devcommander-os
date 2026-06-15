export function generatePRD(prompt: string) {
  return `# PRD

## Product Idea
${prompt}

## Goal
Build a real, usable, maintainable product from this idea.

## Target Users
- Non-technical founders
- Solo builders
- Startup teams
- Professional developers

## Core Features
1. Product creation flow
2. Project Brain
3. PRD generation
4. Architecture generation
5. Task generation
6. Exportable handoff pack

## Success Metrics
- Project created
- PRD generated
- Architecture generated
- Tasks generated
- User can continue development in any AI tool

## MVP Scope
Build the smallest version that proves the idea can become a real software product.`;
}