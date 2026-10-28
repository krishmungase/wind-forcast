# Build the static site with the same pnpm version as local development.
FROM node:22-alpine AS build

ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@11.4.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Serve it with nginx, which also proxies /api to the backend container so the
# browser sees one origin, the same as on Vercel.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
