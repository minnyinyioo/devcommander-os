export function generateArchitecture(prompt: string) {
  return `# Architecture

## Product Idea
${prompt}

## Recommended Stack
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Core Modules
- Landing Page
- Dashboard
- Project Brain
- PRD Engine
- Architecture Engine
- Task Engine
- AI Router
- Export Pack

## Data Model
- projects
- project_documents
- project_tasks
- decision_logs

## Security
- Environment variables
- Row Level Security
- Input validation
- Server-side API routes

## Deployment
- GitHub
- Vercel
- Supabase`;
}