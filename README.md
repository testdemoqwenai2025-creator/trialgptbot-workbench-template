# TrialGPTBot — Clinical Trial AI Workbench (Demo)

[![CI](https://github.com/testdemoqwenai2025-creator/trialgptbot-workbench-template/actions/workflows/ci.yml/badge.svg)](https://github.com/testdemoqwenai2025-creator/trialgptbot-workbench-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-black.svg)](https://bun.sh/)

> A Next.js 16 demo of an AI-augmented clinical trial reviewer workbench — 18 sections covering differential privacy, digital twins, federated learning, neuro-symbolic AI, edge computing, MLOps, and more.

---

## ⚠️ Demo Only — Not a Medical Device

This is a **software demonstration template**. It is NOT:

- ❌ A validated medical device
- ❌ 21 CFR Part 11 certified
- ❌ HIPAA / GDPR compliant
- ❌ Intended for use with real subject data
- ❌ A substitute for clinical judgement

Any production deployment would require: full CSV per GAMP 5, 21 CFR Part 11 validation, ISO 27001 / SOC 2 Type II certification, IRB approval, and real EDC integration contracts.

**Use this template for:** UI prototyping, design exploration, hackathons, education, demo environments.

---

## ✨ Features (18 sections)

| Section | Description |
|---|---|
| **Dashboard** | Trial overview with KPIs and recent activity |
| **Trials** | Trial list + detail view with site enrollment |
| **EDC** | Simulated electronic data capture panel |
| **Compliance** | 21 CFR Part 11 / GAMP 5 mock compliance dashboard |
| **Audit Trail** | Tamper-evident audit log UI (mock events) |
| **Analytics** | Advanced analytics with sparklines and trend charts |
| **Differential Privacy** | ε-budget tracking UI with SMPC sessions |
| **Digital Twins** | Subject twin explorer with what-if scenarios |
| **Edge Computing** | 18-site edge fleet panel with SSE sync log |
| **ML Calibration** | Reliability diagrams + threshold ladder |
| **Federated Learning** | 8-node consortium matrix |
| **NLP Transformers** | 5-model registry with use case explorer |
| **MLOps** | 47-model registry with drift monitoring |
| **Quantum Partnerships** | IBM Q / Google Quantum AI panel |
| **Autonomous Intelligence L5** | Self-improvement loop visualizer |
| **Neuro-Symbolic AI** | 14-node knowledge graph viewer |
| **API Documentation** | 27-endpoint registry with playground |
| **Settings** | 16 scenario configuration wizard |

Plus: **dark theme**, **edge deployment wizard**, **back-to-home navigation**, **WebSocket sync log**.

---

## 🚀 Quick Start

### Option 1: Bun (recommended)

```bash
git clone https://github.com/testdemoqwenai2025-creator/trialgptbot-workbench-template.git
cd trialgptbot-workbench-template
bun install
bun run dev
# → http://localhost:3000
```

### Option 2: Docker

```bash
docker run -d --name trialgptbot -p 3000:3000 \
  ghcr.io/testdemoqwenai2025-creator/trialgptbot-workbench-template:latest
# → http://localhost:3000
```

### Option 3: Docker Compose

```bash
curl -O https://raw.githubusercontent.com/testdemoqwenai2025-creator/trialgptbot-workbench-template/main/docker-compose.yml
docker compose up -d
```

### Option 4: Production build

```bash
bun install
bun run build
bun run start
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + tw-animate-css |
| UI primitives | shadcn/ui (Radix UI) |
| State | Zustand + TanStack Query |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Database | Prisma ORM (SQLite default) |
| Runtime | Bun 1.3 (or Node.js 22+) |
| AI SDK | z-ai-web-dev-sdk (declared, ready to wire) |

---

## 📁 Project Structure

```
trialgptbot-workbench-template/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Main page (section switcher)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles + Tailwind
│   │   └── api/                  # API routes
│   │       ├── edge/sync-stream  # SSE endpoint for edge sync demo
│   │       └── route.ts          # Health check endpoint
│   ├── components/
│   │   ├── layout/               # Sidebar, Navigation, TopBar
│   │   ├── sections/             # 18 feature sections (one per feature)
│   │   └── ui/                   # shadcn/ui primitives
│   └── lib/
│       ├── trialgptbot.ts        # Mock data + TypeScript types (5K LOC)
│       └── utils.ts              # Helpers (cn, formatters)
├── prisma/
│   └── schema.prisma             # SQLite schema (User/Post scaffold)
├── public/                       # Static assets
├── .github/workflows/
│   ├── ci.yml                    # CI: lint + build on push/PR
│   └── release.yml               # Release: tarball + Docker on tag
├── Dockerfile                    # Multi-stage build (~150MB runtime)
├── docker-compose.yml            # One-command startup
├── Makefile                      # Convenience targets
└── package.json
```

---

## 🧪 Development

```bash
# Install deps
bun install

# Start dev server with hot reload
bun run dev

# Lint
bun run lint

# Generate Prisma client
bun run db:generate

# Build for production
bun run build

# Start production server
bun run start
```

---

## 📦 Releasing

This template ships with a complete release pipeline. Tag a version to trigger it:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

The release workflow will:
1. Build a versioned tarball (`trialgptbot-v1.0.0.tar.gz`)
2. Build a multi-arch Docker image (amd64 + arm64) and push to GHCR
3. Create a GitHub Release with auto-generated changelog

---

## 🤝 Use as a Template

Click the green **"Use this template"** button at the top of this repo to create a new repository based on this template. Your new repo will have all the code, CI/CD, and Docker setup — no fork history clutter.

Or via CLI:

```bash
gh repo create my-clinical-workbench --template testdemoqwenai2025-creator/trialgptbot-workbench-template
```

---

## 📋 Roadmap (suggested)

If you're building a real product from this template, here's a suggested priority order:

1. **Replace mock data** in `src/lib/trialgptbot.ts` with real API calls
2. **Wire Prisma** to a real database (Postgres recommended for production)
3. **Add authentication** (NextAuth.js is already a dependency)
4. **Implement audit log** with tamper-evident signatures (21 CFR §11.10(e))
5. **Add EDC ingestion** via CDISC ODM 1.3.x or HL7 FHIR R4
6. **Wire ML inference** — replace at least one mock panel with a real model call
7. **Engage a CSV lead** before any commercial pilot

---

## 📄 License

MIT — see [LICENSE](LICENSE).

You're free to use, modify, and distribute this template. If you build something cool with it, let us know!

---

## ⚠️ Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. In no event shall the authors or copyright holders be liable for any claim, damages or other liability arising from the use of this software.

This software is **not** a medical device and is **not** intended for clinical use. Any deployment in a regulated environment requires appropriate validation, compliance, and regulatory approval.
