FROM node:20.11.1-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build:server

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/packages/multiplayer/dist /app/packages/multiplayer/dist
COPY --from=build /app/packages/multiplayer/node_modules /app/packages/multiplayer/node_modules 
COPY --from=build /app/packages/storage-proto/dist /app/packages/storage-proto/dist
COPY --from=build /app/packages/storage-proto/node_modules /app/packages/storage-proto/node_modules

CMD ["pnpm", "start:prod"]
