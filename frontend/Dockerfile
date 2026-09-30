FROM node:20-slim AS build

WORKDIR /app
RUN npm install --global pnpm@12.8.1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080

RUN npm install --global pnpm@12.8.1

COPY --from=build /app ./

RUN chown -R 1000:1000 /app
USER 1000

CMD ["sh", "-c", "pnpm exec next start -p ${PORT}"]
