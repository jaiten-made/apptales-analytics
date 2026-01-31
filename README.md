# AppTales Analytics Showcase

A comprehensive product event analytics platform that automatically captures and analyzes user interactions with **complete anonymity**. AppTales helps you understand what users do before and after each event by automatically collecting click events, page views, and user journeys. Add it to any site with just **one line of code**.

## What is AppTales?

AppTales is a powerful event analytics tracer that provides deep insights into user behavior through:

- **One-Line Implementation**: Add tracking to any website with a single line of code
- **Anonymous by Default**: Completely anonymous tracking with no personal data collection
- **Automatic Event Capture**: Automatically tracks all click events, page views, and user interactions without manual instrumentation
- **Path Exploration**: Visualize and analyze user journeys before and after specific events (like GA4's path exploration)
- **Session Tracking**: Understand complete user sessions and behavior patterns
- **Real-time Analytics**: Process events at the edge for immediate insights
- **Funnel Analysis**: Track user flows through your application and identify drop-off points

## Tech Stack

This is a **TypeScript-first pnpm monorepo** with strict type safety across all packages and applications.

### Core Technologies

- **Package Manager**: pnpm (workspace-based monorepo)
- **Language**: TypeScript 5 (strict mode everywhere)
- **Build System**: Vite & tsup for bundling
- **Backend**: Node.js with Express.js
- **Frontend**: React 19 with Vite
- **Database**: PostgreSQL with Drizzle ORM
- **Edge Computing**: Cloudflare Workers for event tracking
- **Static Sites**: Astro for landing pages
- **UI Library**: Material-UI 7
- **API Testing**: Bruno

## Monorepo Structure

```
apptales-analytics-showcase/
├── apps/                             # Application projects
│   ├── api/                          # Express.js backend API
│   ├── app/                          # React analytics dashboard
│   ├── landing/                      # Astro marketing site
│   ├── provisioning-portal/          # Provisioning customer accounts
│   └── tracker/                      # One-line embed script hosted on Cloudflare CDN
├── packages/                         # Shared internal packages
│   ├── types/                        # Shared TypeScript types
│   ├── utils/                        # Shared utility functions
│   ├── mui-config/                   # Material-UI theme
│   └── typescript-config/            # TypeScript configs
└── docs/                             # Documentation
    └── agents.md                     # AI coding agent guidance
```

## Getting Started

### Prerequisites

- **Node.js**: v18+ (check `.nvmrc` for exact version)
- **pnpm**: v8+
- **PostgreSQL**: For the backend database

### Installation

```bash
# Install pnpm globally if you haven't already
npm install -g pnpm

# Install all dependencies across the monorepo
pnpm install
```

### Development

#### Start All Applications

```bash
# Run all apps in development mode
pnpm dev
```

#### Start Individual Applications

```bash
# Backend API (Express)
pnpm -F @apptales/api dev

# Frontend Dashboard (React)
pnpm -F @apptales/app dev

# Landing Page (Astro)
pnpm -F @apptales/landing dev

# Provisioning Portal (React)
pnpm -F @apptales/provisioning-portal dev

# Event Tracker (Cloudflare Workers)
pnpm -F @apptales/tracker dev
```

### Database Setup

```bash
# Generate migrations from schema
pnpm -F @apptales/api drizzle-kit generate:pg

# Apply migrations to database
pnpm -F @apptales/api drizzle-kit migrate:pg

# Seed the database with initial data
pnpm -F @apptales/api run seed

# Open Drizzle Studio to view/edit data
pnpm -F @apptales/api drizzle-kit studio
```

### Building for Production

```bash
# Build all packages and applications
pnpm build

# Build specific application
pnpm -F @apptales/api build
pnpm -F @apptales/app build
```

## Key Features

### Automatic Event Tracking

AppTales automatically instruments your application to capture:

- **One-Line Installation**: Simply add `<script src="https://cdn.apptales.com/tracker.js"></script>` to your site
- **Anonymous Tracking**: No cookies, no personal data, fully privacy-compliant
- **Click Events**: Every user interaction with buttons, links, and UI elements
- **Page Views**: Navigation between pages and route changes

### Path Exploration

Understand user journeys with powerful path exploration tools:

- **Before & After Analysis**: See what users did before and after specific events
- **Visual Flow Graphs**: Interactive visualization of user paths
- **Event Sequences**: Identify common patterns in user behavior
- **Conversion Funnels**: Track multi-step processes and identify drop-offs

### Session Analytics

Complete session tracking to understand user engagement:

- **Session Duration**: How long users spend in your application
- **Event Sequences**: Chronological order of user actions
- **Session Replay Context**: Reconstruct user journeys

## Workspace Commands

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm -F @apptales/api test

# Run tests in watch mode
pnpm test --watch
```

### Linting & Type Checking

```bash
# Lint all packages
pnpm lint

# Auto-fix linting issues
pnpm lint --fix

# Type check all packages
pnpm type-check
```

### Package Management

```bash
# Add dependency to specific package
pnpm add <package> --filter @apptales/api

# Add workspace dependency
pnpm add @apptales/types --filter @apptales/api

# Remove dependency
pnpm remove <package> --filter @apptales/api
```

## Architecture

### Event Flow

1. **Capture**: Client-side tracker captures user events
2. **Edge Processing**: Cloudflare Worker receives and validates events
3. **Storage**: Events stored in PostgreSQL via API
4. **Analysis**: Backend processes events for analytics
5. **Visualization**: React dashboard displays insights

### TypeScript Configuration

All projects use strict TypeScript mode with centralized configuration:

- **Base Config**: Strict type checking, no implicit any
- **React Config**: JSX support, React-specific settings
- **Node Config**: CommonJS/ESM interop, Node.js types

## Documentation

- **Root Guide**: [docs/agents.md](docs/agents.md) - Workspace conventions & setup
- **API Guide**: [apps/api/agents.md](apps/api/agents.md) - Backend specifics
- **App Guide**: [apps/app/agents.md](apps/app/agents.md) - Frontend specifics
- **Landing Guide**: [apps/landing/agents.md](apps/landing/agents.md) - Static site specifics
- **Portal Guide**: [apps/provisioning-portal/agents.md](apps/provisioning-portal/agents.md) - Provisioning UI specifics
- **Tracker Guide**: [apps/tracker/agents.md](apps/tracker/agents.md) - Edge worker specifics
