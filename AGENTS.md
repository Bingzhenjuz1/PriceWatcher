# AGENTS.md

## Skills Directory
- `./skills`
- `./skills/superpowers`

## Project Persona File
- `./SOUL.md`

## Confirmed Tech Stack (MVP)
- Frontend: `Next.js 15 + React + TypeScript`
- Backend: `Next.js Route Handlers`
- Database: `PostgreSQL + Prisma`
- Cache/Queue: `Redis + BullMQ`
- Data Collection: adapter-first, `Playwright` when needed
- Testing: `Vitest` + `Playwright`
- Quality: `ESLint + Prettier + Husky + lint-staged`

## Runtime Prerequisite
- Node.js `>= 20.9` (current setup uses `22.14.0`)

## Commands (to fill after scaffold)
- Run: `cd web && npm run dev`
- Build: `cd web && npm run build`
- Test: `cd web && npm run test`
- Lint: `cd web && npm run lint`

## API Testing Tool
- Use `Apifox` for API debugging and API test cases.

## Commit Policy (Mandatory)
- After completing any feature change (including small changes), run related tests first, then commit and push immediately.
- Do not batch multiple unrelated features into one commit.
- Each commit must include a Chinese change note clearly stating what was modified (in commit message and/or PR/summary text).
