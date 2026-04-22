# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Apps

- `artifacts/ffa-shooter` — React + Vite + Three.js 3D shooter (frontend)
- `artifacts/api-server` — Express backend (not currently wired into the workflow)
- `artifacts/mockup-sandbox` — Vite mockup tool

## Replit Setup

- Workflow `Start application` runs the ffa-shooter Vite dev server on port 5000 with `BASE_PATH=/`.
- Vite is configured with `host: 0.0.0.0` and `allowedHosts: true` to work behind the Replit proxy.
- Deployment is configured as a static build of the ffa-shooter app (`artifacts/ffa-shooter/dist/public`).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
