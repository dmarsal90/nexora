# Nexora

Private internal workspace for researching local businesses, preparing web proposals, and managing client delivery. Nexora is not a public SaaS product: there is no public registration, user subscription, or access-credit system.

## Current phase

Phase 0 planning is complete and owner-approved. Phase 1 foundation is in progress. The API, private authentication, and commercial modules are being delivered phase by phase; unfinished modules are labeled in the app rather than backed by sample data.

## Local development

Requirements: Docker Engine with Compose v2+, Node.js 24 LTS, and Corepack/pnpm 12.11.2. Install workspace dependencies on the host before starting the Linux development containers; the containers reuse the workspace `node_modules` bind mount for hot reload.

1. Copy `.env.example` to `.env`; replace the MongoDB/Redis passwords and `MONGO_REPLICA_SET_KEY` with random local values. Generate the replica key with `openssl rand -hex 48` and `ENCRYPTION_KEY` with `openssl rand -hex 32`.
2. Set a one-time `BOOTSTRAP_ADMIN_EMAIL` and a unique `BOOTSTRAP_ADMIN_PASSWORD` of at least 16 characters in `.env`.
3. Run `corepack enable` and `pnpm install`.
4. Start the development stack with `docker compose up -d --build`.
5. Create the first admin: `docker compose --profile bootstrap run --rm bootstrap`.
6. Keep the initial password in your local password manager and remove `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` from `.env` after bootstrap. The API service never receives bootstrap credentials.
7. Open `http://localhost:8080`, sign in, and enroll the administrator in an authenticator app.

Useful commands:

```bash
docker compose ps
docker compose logs -f api worker
docker compose down
pnpm typecheck
pnpm test
pnpm build
```

MongoDB and Redis have no host ports published. Nginx exposes the development app on `WEB_PORT` (default 8080); it proxies the Vite server and `/api/v1` to Express. The landing renderer is internal and only returns a non-indexable foundation page. No external data provider is configured in Phase 1.

## Security notes

- Do not commit `.env`, bootstrap credentials, customer data, OAuth credentials, logs, or generated exports.
- The example credentials are for local development only. Production requires externally managed secrets, HTTPS, private MongoDB/Redis networking, backups, and a reviewed deployment configuration.
- Admin accounts require TOTP MFA. Passwords use Argon2id; browser sessions are opaque, revocable, stored by hash, and carried in HttpOnly cookies.
- Provider integrations remain disabled until credentials, permitted data use, retention, and budgets are reviewed.

## Architecture and product decisions

The required product, architecture, flow, UX, schema, implementation, traceability, and progress documents are under `docs/`. API contract work is tracked in `docs/api/openapi.yaml`.
