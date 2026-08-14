# ============================================================
# TrialGPTBot Enterprise — Makefile
# ============================================================
# Convenience targets for local dev, CI, and release.
# Run `make help` to see all targets.

SHELL := /bin/bash
.DEFAULT_GOAL := help

# Versions
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "v0.0.0-dev")
IMAGE  ?= ghcr.io/testdemoqwenai2025-creator/trialgptbotdemo2

# Tools
BUN    := bun
DOCKER := docker

.PHONY: help install dev build start lint db

help: ## Show this help
        @grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
                awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
        $(BUN) install

dev: ## Start dev server (hot reload)
        $(BUN) run dev

build: ## Production build (Next.js standalone)
        $(BUN) run build

start: ## Start production server
        $(BUN) run start

lint: ## Lint
        $(BUN) run lint

db: ## Generate Prisma client + push schema
        $(BUN) run db:generate
        $(BUN) run db:push

# ============================================================
# Bundle / binary targets
# ============================================================

.PHONY: bundle docker docker-run docker-push release tag clean

bundle: ## Build versioned tarball bundle (./dist/trialgptbot-<ver>.tar.gz)
        @mkdir -p dist
        @echo ">> Building standalone..."
        $(BUN) run build
        @echo ">> Packaging tarball $(VERSION)..."
        @STAGE=$$(mktemp -d)/trialgptbot-$(VERSION) && \
                mkdir -p $$STAGE && \
                cp -r .next/standalone $$STAGE/standalone && \
                cp -r prisma $$STAGE/prisma && \
                cp -r db $$STAGE/db && \
                cp README.md LICENSE $$STAGE/ 2>/dev/null || true && \
                cp -r docs $$STAGE/docs 2>/dev/null || true && \
                printf '#!/usr/bin/env bash\nset -euo pipefail\ncd "$$(dirname "$$0")"\nexport NODE_ENV=production\nexport PORT="$${PORT:-3000}"\nexport DATABASE_URL="$${DATABASE_URL:-file:./db/custom.db}"\nexec bun standalone/server.js\n' > $$STAGE/run.sh && \
                chmod +x $$STAGE/run.sh && \
                tar czf dist/trialgptbot-$(VERSION).tar.gz -C $$(dirname $$STAGE) $$(basename $$STAGE) && \
                sha256sum dist/trialgptbot-$(VERSION).tar.gz > dist/trialgptbot-$(VERSION).tar.gz.sha256 && \
                rm -rf $$STAGE
        @echo "✓ Bundle: dist/trialgptbot-$(VERSION).tar.gz"
        @ls -lh dist/

docker: ## Build Docker image locally
        $(DOCKER) build -t $(IMAGE):local -t $(IMAGE):$(VERSION) .

docker-run: ## Run Docker image locally (port 3000)
        $(DOCKER) run --rm -it -p 3000:3000 --name trialgptbot $(IMAGE):local

docker-push: ## Push image to GHCR (requires docker login)
        $(DOCKER) push $(IMAGE):$(VERSION)
        $(DOCKER) push $(IMAGE):latest

tag: ## Create and push a version tag (e.g. make tag VERSION=v0.3.0)
        @if [ -z "$(VERSION)" ] || [ "$(VERSION)" = "v0.0.0-dev" ]; then \
                echo "Usage: make tag VERSION=v0.3.0"; exit 1; \
        fi
        git tag -a $(VERSION) -m "Release $(VERSION)"
        git push origin $(VERSION)
        @echo "✓ Tagged $(VERSION) — release workflow will run automatically"

release: bundle ## Full release: build bundle, create tag, push (triggers GH Actions)
        @if [ -z "$(VERSION)" ] || [ "$(VERSION)" = "v0.0.0-dev" ]; then \
                echo "Usage: make release VERSION=v0.3.0"; exit 1; \
        fi
        @echo ">> Creating release $(VERSION)..."
        git add -A
        git commit -m "release: $(VERSION)" || true
        git tag -a $(VERSION) -m "Release $(VERSION)"
        git push origin main
        git push origin $(VERSION)
        @echo "✓ Pushed $(VERSION). Watch: https://github.com/testdemoqwenai2025-creator/TrialGTPBoTDemo2/actions"

clean: ## Remove build artifacts
        rm -rf dist .next/standalone
        @echo "✓ Cleaned"
