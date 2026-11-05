FROM node:26-alpine AS base

RUN npm i -g pnpm@12.16.1

# Install all dependencies
FROM base AS dependencies

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# Bundle the app into dist/
FROM base AS build

WORKDIR /usr/src/app

COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN pnpm build
RUN pnpm prune --prod

# Run migrations
FROM base AS migrate

WORKDIR /usr/src/app

COPY . .
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

CMD ["pnpm", "db:migrate"]

# Final image: production dependencies + bundle, running as non-root
FROM cgr.dev/chainguard/node:latest AS deploy

USER 1000

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

EXPOSE 3333

CMD ["dist/infra/http/server.js"]
