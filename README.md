# NAVS — Not Another Vibecoding SaaS

An AI-powered web development platform that lets you build and deploy full-stack web applications by chatting with AI. Describe what you want, and NAVS generates, runs, and previews the code in real time inside an isolated sandbox.

## ✨ Features

- **Conversational App Building** — Describe your idea in natural language and an AI code agent generates a complete Next.js application
- **Live Preview** — View your generated app running in a sandboxed environment, embedded directly in the browser
- **Code Explorer** — Browse and inspect every generated file with syntax highlighting in an IDE-like file tree
- **Iterative Development** — Continue chatting to refine and extend your project across multiple iterations
- **Real-Time Thinking Indicator** — See the agent's reasoning as it works, with live "thinking" updates streamed to the UI
- **Project Management** — Create, list, and revisit past projects with full conversation history
- **Credit-Based Usage** — Tiered billing (Free / Pro) powered by Clerk's PricingTable with Prisma-backed rate limiting
- **Responsive Design** — Resizable split-pane IDE layout on desktop; segmented Chat / Demo / Code views on mobile
- **Dark / Light Theme** — System-aware theme switching via `next-themes`
- **Starter Templates** — Preset prompts (budget tracker, recipe app, habit tracker, etc.) for quick project creation

## 🏗️ Architecture

```
User prompt
  → tRPC mutation (projects.create / messages.create)
    → Credit check (rate-limiter-flexible + Prisma Usage table)
    → Inngest event "code-agent/run"
      → E2B Sandbox spins up (custom Next.js template)
      → GPT-4.1 agent iterates (max 15 loops) using tools:
          • terminal — run shell commands
          • createOrUpdateFiles — write files into the sandbox
          • readFiles — read existing sandbox files
      → Agent produces <task_summary> to signal completion
      → GPT-4o generates a user-friendly response + fragment title
      → Result saved as Message + Fragment (sandbox URL, title, file map)
        → UI renders live preview via iframe + file explorer
```

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript 5 |
| **Auth** | Clerk (`@clerk/nextjs`) with Free / Pro plans |
| **API** | tRPC 11 (type-safe client ↔ server procedures) |
| **Database** | PostgreSQL via Prisma 6 (Driver Adapters + `@prisma/adapter-pg`) |
| **AI Agent** | Inngest Agent Kit (`@inngest/agent-kit`) + OpenAI GPT-4.1 |
| **Sandbox** | E2B Code Interpreter (`@e2b/code-interpreter`) |
| **Rate Limiting** | `rate-limiter-flexible` with Prisma persistence |
| **UI Components** | shadcn/ui (Radix primitives + Tailwind CSS 4) |
| **Styling** | Tailwind CSS 4, `tw-animate-css`, `next-themes` |
| **Fonts** | Geist Sans + Geist Mono (via `next/font`) |
| **State & Data Fetching** | TanStack React Query + tRPC bindings |
| **Misc** | PrismJS (syntax highlighting), `react-resizable-panels`, Sonner (toasts), Recharts, Zod 4 |

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (home)/                 # Landing page, pricing, sign-in/sign-up
│   ├── projects/[projectId]/   # Project workspace page
│   └── api/                    # tRPC + Inngest API routes
├── modules/                    # Feature-based modules
│   ├── home/                   # Landing page UI + template constants
│   ├── projects/               # Project CRUD procedures + IDE view
│   ├── messages/               # Message CRUD procedures
│   └── usage/                  # Usage status procedure
├── inngest/                    # Agent orchestration
│   ├── functions.ts            # Code agent Inngest function
│   ├── utils.ts                # Sandbox helpers, output parsers
│   └── client.ts               # Inngest client
├── trpc/                       # tRPC setup
│   ├── routers/_app.ts         # Root router (projects, messages, usage)
│   ├── init.ts                 # Procedures + context
│   ├── client.tsx              # React provider
│   └── server.tsx              # Server-side caller
├── components/                 # Shared UI (shadcn/ui + custom)
├── hooks/                      # Custom hooks (mobile, theme, scroll)
├── lib/                        # DB client, usage tracker, utilities
├── prompt.ts                   # System prompts for code agent
└── middleware.tsx               # Clerk auth middleware
prisma/
├── schema.prisma               # Project, Message, Fragment, Usage models
└── migrations/                 # Database migrations
sandbox-templates/
└── nextjs/                     # E2B sandbox Dockerfile + boot script
```

## 📊 Data Model

| Model | Purpose |
|---|---|
| **Project** | A user's app project (name, userId, timestamps) |
| **Message** | Chat messages (USER / ASSISTANT) with type (RESULT, ERROR, THINKING) |
| **Fragment** | Generated code snapshot: sandbox URL, title, and full file map (JSON) |
| **Usage** | Per-user credit consumption tracking for rate limiting |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- API keys for: **Clerk**, **OpenAI**, **Inngest**, **E2B**

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# OpenAI
OPENAI_API_KEY=sk-...

# Inngest
INNGEST_SIGNING_KEY=...
INNGEST_EVENT_KEY=...

# E2B
E2B_API_KEY=...
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building.

### Running Inngest Dev Server

In a separate terminal, start the Inngest dev server to process agent events locally:

```bash
npx inngest-cli@latest dev
```

