# CaptionAI — AI Image Caption Generator

Upload a photo, and CaptionAI reads the scene and writes social, marketing, and SEO copy
that actually matches the image.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma**,
**PostgreSQL**, and **Auth.js v5**.

## Features

- **Vision analysis** — objects, scene, lighting, mood, and brand context extracted in one pass.
- **17 caption styles** — Instagram, LinkedIn, Facebook, X/Twitter, SEO, product, travel, food,
  fashion, and more.
- **8 tones & 7 languages** — professional, funny, emotional, luxury, and more, in EN/ES/FR/HI/DE/JA/ZH.
- **Brand voice** — lock your tone once and reuse it across every campaign.
- **Export anywhere** — copy, TXT, PDF, DOCX, plus scheduled posts and full history.
- **Billing** — Free / Starter / Pro / Business plans with monthly credits and Stripe checkout.
- **Workspaces & admin** — team members, role-based access, and usage analytics.

### AI providers

Google **Gemini Vision** (`gemini-2.0-flash`) is the primary provider, with **OpenAI GPT-4.1
Vision** (`gpt-4.1`) as an automatic fallback.

## Tech stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Framework  | Next.js 15.2.4 (App Router, Turbopack, React 19)         |
| Language   | TypeScript 5.8                                          |
| Styling    | Tailwind CSS 4, Radix UI, `tailwind-merge`              |
| Database   | PostgreSQL 16 via Prisma 6                              |
| Auth       | Auth.js (NextAuth v5 beta) + Prisma adapter, bcryptjs   |
| AI         | `@google/generative-ai`, `openai`                       |
| Storage    | Supabase Storage, with a local filesystem fallback       |
| Payments   | Stripe                                                 |
| Media      | `sharp` for image processing                            |
| Testing    | Vitest                                                  |
| Export     | `pdf-lib`, `docx`                                       |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Generate an auth secret:

```bash
openssl rand -base64 32
```

At minimum, set `DATABASE_URL` and `AUTH_SECRET`. See
[`.env.example`](./.env.example) for the full list of supported variables.

### 3. Start PostgreSQL

```bash
docker compose up -d
```

Or point `DATABASE_URL` at an existing PostgreSQL / Supabase instance.

### 4. Set up the database

```bash
npm run db:push    # push the Prisma schema
npm run db:seed    # create the admin account
```

The seeded admin comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(default `admin@captionai.app` / `ChangeMe_Admin1!` — change these).

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script              | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the dev server (Turbopack)    |
| `npm run build`     | `prisma generate` + `next build`   |
| `npm run start`     | Start the production server        |
| `npm run lint`      | Run ESLint                         |
| `npm test`          | Run the Vitest suite once          |
| `npm run test:watch`| Run Vitest in watch mode           |
| `npm run db:push`   | Push the Prisma schema to the DB   |
| `npm run db:migrate`| Create a Prisma migration          |
| `npm run db:seed`   | Seed the admin account             |

## Project structure

```
src/
  app/                  # App Router pages and API routes
    (app)/              # Authenticated shell: dashboard, generate, history, ...
    api/                # generate, upload, captions, billing, auth, admin, ...
  application/          # Use cases (clean architecture boundary)
  domain/               # Entities and domain errors
  infrastructure/       # Prisma repos, AI providers, storage, email, rate limits
  components/           # UI primitives and layout
  hooks/  lib/  types/  constants/
prisma/
  schema.prisma         # Data model
  seed.ts               # Admin seed
```

The codebase follows a light **clean architecture**: `app` → `application` → `domain`, with all
external concerns (Prisma, OpenAI, Gemini, Supabase, Stripe, Resend) isolated in
`src/infrastructure`.

## Data model

`User`, `Account`, `Session`, `VerificationToken` (Auth.js), `CaptionHistory`, `UsageDaily`,
`Notification`, `ApiKey`, `AuditLog`, `Workspace`, `WorkspaceMember`, and `ScheduledPost`.

## License

MIT
