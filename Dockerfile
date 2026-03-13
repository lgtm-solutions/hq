FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json packages/db/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS build
COPY packages/db packages/db
COPY apps/web apps/web
RUN pnpm build

# Production
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY --from=deps /app/apps/web/node_modules apps/web/node_modules
COPY --from=deps /app/packages/db packages/db
COPY --from=build /app/apps/web/build apps/web/build
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/

EXPOSE 3000
CMD ["node", "apps/web/build"]
