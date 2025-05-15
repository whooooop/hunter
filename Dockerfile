FROM node:20.11.1-slim AS base
COPY . /app
WORKDIR /app

# FROM base AS prod-deps
# # RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN npm ci
RUN find src -name "*.test.ts" -delete
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081
CMD ["nginx", "-g", "daemon off;"]
