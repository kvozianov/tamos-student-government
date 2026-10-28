# Self-hosted image for the school server. Next.js prerenders pages from the database,
# so the production build runs when the container starts, after migrations.
FROM node:22-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm run build && npm run start"]
