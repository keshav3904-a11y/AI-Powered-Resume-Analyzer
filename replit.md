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

## Project: AI-Powered Resume Analyzer

A full-stack web app that analyzes resumes against job roles using NLP and scoring logic.

### Features
- PDF upload with client-side text extraction (pdfjs-dist)
- 5 predefined job roles: Data Scientist, ML Engineer, Software Developer, Data Analyst, AI Engineer
- Resume parsing: name, email, phone, education, experience, projects, certifications
- Skill extraction from a 130+ skill database
- Weighted scoring: Skill (50%), Experience (25%), Education (15%), Projects (10%)
- Visual dashboard: gauge score, pie chart, bar chart
- Missing skills, matched skills, strength areas
- Resume summary, improvement tips, skill recommendations
- Download report as text file
- About page with developer credits

### Developers
- Kevalram Vaishnav
- Keshav Agarwal
- Dept: Computer Science Engineering (AI & ML)
- Institution: Jodhpur Institute of Engineering and Technology

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── jobRoles.ts         # 5 predefined job roles
│   │       │   ├── skillsDatabase.ts   # 130+ skills
│   │       │   └── resumeAnalyzer.ts   # Core NLP analysis engine
│   │       └── routes/
│   │           └── resume.ts           # POST /api/resume/analyze, GET /api/resume/job-roles
│   └── resume-analyzer/    # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
└── scripts/                # Utility scripts
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## API Endpoints

- `GET /api/healthz` — health check
- `GET /api/resume/job-roles` — list all job roles
- `POST /api/resume/analyze` — analyze resume `{ resumeText, jobRole }` → full analysis
