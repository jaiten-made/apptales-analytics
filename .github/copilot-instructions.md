# GitHub Copilot Instructions

This file directs GitHub Copilot to reference the comprehensive AGENTS.md documentation in this pnpm monorepo.

## Documentation Structure

This monorepo uses AGENTS.md files for AI coding agent guidance:

- **[docs/agents.md](../docs/agents.md)** - Root workspace conventions, TypeScript style, naming conventions, file organization, build commands, and references to all project-specific guidance

- **Project-Specific Documentation** (each references root conventions):
  - [apps/api/agents.md](../apps/api/agents.md) - Express.js backend specifics
  - [apps/app/agents.md](../apps/app/agents.md) - React frontend specifics
  - [apps/landing/agents.md](../apps/landing/agents.md) - Astro static site specifics
  - [apps/provisioning-portal/agents.md](../apps/provisioning-portal/agents.md) - React provisioning UI specifics
  - [apps/tracker/agents.md](../apps/tracker/agents.md) - Cloudflare Workers specifics

## How Copilot Should Use These Files

1. **Always reference the root [docs/agents.md](../docs/agents.md) first** - It contains all global conventions, naming rules, TypeScript configuration, and links to project-specific files
2. **For project-specific work**, read the nearest agents.md file (e.g., `apps/api/agents.md` when working on the API)
3. **Never duplicate information** - Each agents.md references the root for global conventions rather than repeating them
4. **Follow the established patterns** - Naming conventions, code style, file organization, and tech stack versions are all documented

## When in Doubt

Refer to the appropriate agents.md file based on your current context. All necessary information is consolidated there without duplication.
