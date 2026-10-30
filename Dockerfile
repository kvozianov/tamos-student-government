# Self-hosted image for the school server. Next.js prerenders pages from the database,
# so the production build runs when the container starts, after migrations.
FROM node:22-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1

# The app runs as the unprivileged "node" user from the base image. It owns /app because the build
# at container start writes .next, and the upload folders that docker-compose mounts as volumes.
WORKDIR /app
RUN mkdir -p /app/media /app/documents && chown -R node:node /app
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .

EXPOSE 3000
CMD ["sh", "-c", "npm run migrate && npm run build && npm run start"]
