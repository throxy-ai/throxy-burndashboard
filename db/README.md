# Turso Setup

1. .env.local is created automatically with auth defaults.
2. Set DATABASE_URL to your Turso database URL (libsql://...).
3. Set DATABASE_AUTH_TOKEN.
4. Optional: set AUTH_ADMIN_EMAILS to bootstrap admin users.
5. AUTH_GOOGLE_ACCOUNT_MODE defaults to throxy_only (set to all to allow any Google account).
6. Run bun run db:push.

Use bun run db:studio for local schema inspection.
