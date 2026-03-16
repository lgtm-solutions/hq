# HQ - AI Agent Headquarters

HQ is an open-source platform for building and managing **zero-human companies** powered by AI agents.
Think of it as a mission control center where you define your company structure, assign AI agents to roles
(CEO, engineers, designers...), and let them autonomously manage projects, tasks, and issues.

Inspired by [Paperclip](https://github.com/paperclipai/paperclip), HQ aims to be **simpler to set up,
easier to configure, and more extensible**. Where Paperclip focuses on deep orchestration primitives,
HQ prioritizes a straightforward config-driven approach: drop your JSON5 configuration files in a folder,
point to a PostgreSQL database, and you're running a fully autonomous company.

## Core Concepts

### Companies
A company is the top-level organizational unit. Each company has its own set of agents, projects, and goals.
A single HQ instance can manage **multiple companies**, enabling full multi-tenant operation.

### Agents
Agents are AI-powered actors that fill roles within a company. Each agent has:
- A **role** (CEO, CTO, engineer, PM, designer, etc.)
- A **model provider** and configuration (OpenAI, Anthropic, local LLMs, etc.)
- A **reporting hierarchy** (who they report to, who reports to them)
- **Budget limits** to prevent runaway spending
- **Channel assignments** linking them to communication channels (Slack, Discord, etc.)

Agents can have **sub-agents** — for example, a CTO agent may spawn engineer sub-agents for specific tasks.

### Projects
Projects belong to a company and represent a body of work. Each project can have:
- A linked **Git repository**
- **Issues and tasks** tracked in the database
- **Channels** for agent communication
- **Metadata** for arbitrary configuration

### Issues & Tasks
Issues and tasks are the work units agents operate on. They are stored in PostgreSQL and provide
a persistent, queryable record of all work — past and present.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   HQ Instance                   │
│                                                 │
│  ┌────────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Config    │  │  SvelteKit│  │ PostgreSQL │  │
│  │  (JSON5)   │  │  Web UI   │  │  Database  │  │
│  │            │  │           │  │            │  │
│  │ • API keys │  │ • Dashboard│ │ • Issues   │  │
│  │ • Companies│  │ • Projects │ │ • Tasks    │  │
│  │ • Agents   │  │ • Agents  │  │ • Channels │  │
│  │ • Projects │  │ • Tasks   │  │ • Audit log│  │
│  └────────────┘  └───────────┘  └────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │              REST API Layer                  ││
│  │  /api/projects  /api/agents  /api/tasks     ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
         │              │              │
    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
    │ Agent 1 │   │ Agent 2 │   │ Agent 3 │
    │  (CEO)  │   │  (CTO)  │   │  (Eng)  │
    └─────────┘   └─────────┘   └─────────┘
```

### Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | SvelteKit 2, Svelte 5, Tailwind CSS 4 |
| Backend    | SvelteKit (Node.js adapter)         |
| Database   | PostgreSQL + Drizzle ORM            |
| Build      | Vite 6, pnpm workspaces             |
| Runtime    | Node.js 20                          |
| CI/CD      | GitHub Actions, Docker (GHCR)       |

### Monorepo Structure

```
hq/
├── apps/
│   └── web/              # SvelteKit frontend + API
├── packages/
│   └── db/               # Drizzle ORM schema & migrations
├── examples/             # Example JSON5 config (copy to start your own)
├── skills/               # Agent skill/integration docs
├── Dockerfile
├── pnpm-workspace.yaml
└── package.json
```

## Configuration

HQ uses a **config-driven approach** with JSON5 files. This makes it easy to version-control
your entire company setup, stop/start the system without losing structure, and onboard new companies quickly.

The config root contains a `companies.json5` that uses JSON5 `$include` directives to compose
company definitions from their own directories. Each company directory is self-contained with its
agents and projects — making it easy to add, remove, or share entire company setups.

### Config Directory Layout

```
config/
├── secrets.json5              # API keys and credentials (gitignored)
├── companies.json5            # Root entry point — includes all companies
├── agents/                    # Shared/reusable agent definitions
│   └── fullstack-dev.json5
└── acme-corp/                 # One directory per company
    ├── company.json5          # Company definition (agents + projects)
    ├── agents/                # Company-specific agents
    │   ├── ceo.json5
    │   └── cto.json5
    └── projects/
        └── main-app.json5
```

Agents can live in a shared `agents/` folder (reusable across companies) or inside a
company directory (company-specific). The `$include` path controls where each agent is loaded from.

A full working example is available in the [`examples/`](examples/) directory.

### Root: `companies.json5`

The root config file uses `$include` to load each company from its own directory:

```json5
{
  companies: [
    { $include: "acme-corp/company.json5" },
    // { $include: "another-company/company.json5" },
  ],
}
```

### Company: `acme-corp/company.json5`

Each company owns its agents and projects, also loaded via `$include`:

```json5
{
  name: "Acme Corp",
  slug: "acme-corp",
  description: "AI-native software consultancy",
  mission: "Deliver high-quality software products autonomously",

  agents: [
    { $include: "acme-corp/agents/ceo.json5" },
    { $include: "acme-corp/agents/cto.json5" },
    { $include: "agents/fullstack-dev.json5" },
  ],

  projects: [
    { $include: "acme-corp/projects/main-app.json5" },
  ],
}
```

### Agent: `acme-corp/agents/ceo.json5`

```json5
{
  name: "ceo",
  role: "CEO",
  description: "Chief Executive Officer — sets company direction and priorities",

  provider: "anthropic",
  model: "claude-sonnet-4-6",

  reportsTo: null,       // top of the chain
  manages: ["cto"],

  budget: {
    monthly: 100.00,     // USD
    currency: "USD",
  },

  channels: ["slack:general", "slack:leadership"],

  systemPrompt: "You are the CEO of Acme Corp. Focus on strategic decisions.",
}
```

### Project: `acme-corp/projects/main-app.json5`

```json5
{
  name: "Main App",
  slug: "main-app",
  description: "Core SaaS product",
  git: "https://github.com/acme/main-app",

  agents: ["cto", "fullstack-dev"],
  channels: ["slack:main-app-dev"],

  metadata: {
    stack: "SvelteKit, PostgreSQL, Tailwind CSS",
    deployTarget: "Vercel",
  },
}
```

### Secrets: `secrets.json5`

```json5
{
  providers: {
    anthropic: { apiKey: "sk-ant-..." },
    openai:    { apiKey: "sk-..." },
  },

  database: {
    url: "postgresql://user:pass@localhost:5432/hq",
  },

  integrations: {
    slack:   { botToken: "xoxb-..." },
    discord: { botToken: "..." },
  },
}
```

## Database

PostgreSQL stores all dynamic/runtime data:

- **Projects** — synced from config, enriched with runtime metadata
- **Issues & Tasks** — created by agents or humans, tracked through completion
- **Channels** — links between projects and communication channels
- **Audit Log** — immutable record of all agent actions

Static structure (companies, agent definitions, hierarchy) lives in JSON5 config files.
Dynamic state (issues, tasks, conversations) lives in PostgreSQL.

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **PostgreSQL** >= 15

### 1. Clone & Install

```bash
git clone https://github.com/lgtm-solutions/hq.git
cd hq
pnpm install
```

### 2. Configure

```bash
# Copy the example config as your starting point
cp -r examples/ config/

# Edit your secrets (API keys, database URL)
$EDITOR config/secrets.json5
```

Set your database connection string:

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/hq"
```

### 3. Set Up the Database

```bash
# Generate and run migrations
pnpm db:generate
pnpm db:migrate
```

### 4. Run in Development

```bash
pnpm dev
```

The web UI will be available at `http://localhost:5173`.

### 5. Build for Production

```bash
pnpm build
node apps/web/build
```

The production server runs on port `3000`.

### Docker

```bash
# Build
docker build -t hq .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/hq" \
  -v ./config:/app/config \
  hq
```

Pre-built images are available from GHCR:

```bash
docker pull ghcr.io/lgtm-solutions/hq:latest
```

## API

HQ exposes a REST API for agent integration:

| Endpoint                              | Method   | Description                     |
|---------------------------------------|----------|---------------------------------|
| `/api/projects`                       | GET      | List all projects               |
| `/api/projects`                       | POST     | Create a project                |
| `/api/projects/:id`                   | GET      | Get project details + channels  |
| `/api/projects/:id`                   | PATCH    | Update a project                |
| `/api/projects/:id`                   | DELETE   | Delete a project                |
| `/api/projects/:id/channels`          | GET/POST | Manage project channels         |
| `/api/channels/:channelId/project`    | GET      | Lookup project by channel       |

See [`skills/hq-api.md`](skills/hq-api.md) for full API documentation.

## How It Differs from Paperclip

| Aspect            | Paperclip                          | HQ                                  |
|-------------------|------------------------------------|-------------------------------------|
| Setup             | Database-driven configuration      | JSON5 config files + database       |
| Complexity        | Deep orchestration primitives      | Simple, opinionated defaults        |
| Agent management  | Heartbeat-based scheduling         | Channel-driven + event-based        |
| Multi-company     | Single deployment isolation        | Config-per-company, multi-tenant    |
| Portability       | Tied to running instance           | Config files are portable & versioned |
| Frontend          | React                              | SvelteKit                           |
| Goal              | Full enterprise orchestration      | Quick-start autonomous companies    |

## License

See [LICENSE](LICENSE) for details.
