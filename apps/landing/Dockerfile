FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

# Install corepack so pnpm is available
RUN corepack enable

WORKDIR /app

# Install only production dependencies in a separate stage to keep final image small
FROM base AS build
COPY . .
# Use BuildKit cache for pnpm store when available. Try frozen install first, fall back if lockfile isn't present
RUN --mount=type=cache,id=pnpm,target=/pnpm/store sh -lc "pnpm install --frozen-lockfile || pnpm install"
RUN pnpm run build

FROM node:20-slim AS runtime
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"
RUN corepack enable
WORKDIR /app

# Copy production node_modules and built output
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]