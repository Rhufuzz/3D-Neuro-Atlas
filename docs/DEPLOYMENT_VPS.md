# VPS deployment runbook

The app runs on the owner's Ubuntu 24.04 VPS **alongside other applications**. The IP is intentionally not in this
public repo — replace `YOUR_VPS_IP` below.

## Current production layout

| Item | Value |
|---|---|
| URL | `https://YOUR_VPS_IP:8445` (self-signed certificate → browser warning; accept it) |
| App directory | `/opt/cortex-aether` (owned by system user `cortex`) |
| Process | systemd unit `cortex-aether` (`deploy/cortex-aether.service`) → `next start` on `127.0.0.1:3100` |
| Reverse proxy | nginx site `/etc/nginx/sites-available/cortex-aether` (`deploy/nginx-cortex-aether.conf`), `listen 8445 ssl` |
| TLS cert | `/etc/ssl/cortex-aether/cortex-aether.{crt,key}` (self-signed, created by `deploy.sh`) |
| Database | local PostgreSQL 16, database + role `cortex_aether` (created by `setup-env.sh`) |
| Secrets | `/opt/cortex-aether/.env` (mode 600, generated on the server, never committed) |
| Node | `/usr/bin/node` (v24 at the time of writing; app needs ≥ 20.9) |
| Deploy log | `/var/log/cortex-aether-deploy.log` (when deploy is run with output redirected there) |

**Ports already used by other apps on this server — do not use or touch:** 80, 443, 3000, 3001, 3002, 4000, 5432 (shared
PostgreSQL; only use the `cortex_aether` database), 6379, 8000, 8001, 8123, 8443, 8444, 11434, 18555, 18790.
Never edit other nginx sites or other databases. `deploy.sh` disables only its own site if `nginx -t` fails.

## Everyday operations (as root)

```bash
systemctl status cortex-aether            # is it running?
journalctl -u cortex-aether -n 100 -f     # app logs
systemctl restart cortex-aether           # restart
cd /opt/cortex-aether && bash deploy/update.sh          # pull main from GitHub, rebuild, restart
BRANCH=feature-x bash deploy/update.sh                  # deploy another branch
```

## Database backups & disaster recovery

A daily backup job runs via root cron at 03:00 UTC (`scripts/backup.sh`):
- Compressed dumps stored in `/var/backups/cortex-aether/`
- Retention: 14 rolling daily snapshots
- Log: `/var/log/cortex-backup.log`

### Restoring from backup
```bash
# 1. Stop the application
systemctl stop cortex-aether

# 2. Pick a snapshot
LATEST=$(ls -t /var/backups/cortex-aether/cortex_aether_*.sql.gz | head -1)

# 3. Restore via pg_restore
gunzip -c "$LATEST" | su - postgres -c "pg_restore -d cortex_aether --clean --if-exists"

# 4. Restart and check health
systemctl start cortex-aether
curl http://127.0.0.1:3100/api/health
```

`update.sh` turns the folder into a git checkout on first use (it was originally installed from a tarball),
hard-resets tracked files to the fetched branch (`.env`, `node_modules`, `.next` are untracked and kept), then runs
`deploy.sh`.

## What `deploy/deploy.sh` does (idempotent)

1. Creates system user `cortex` if missing; requires `.env`.
2. `npm install --legacy-peer-deps` (runs `prisma generate` via `postinstall`), `npx prisma db push`, `npm run build`.
3. `chown -R cortex:cortex`, `chmod 600 .env`.
4. Creates the self-signed certificate if missing.
5. Installs the systemd unit and nginx site, runs `nginx -t` (on failure removes only its own site and exits),
   reloads nginx, enables + restarts `cortex-aether`.
6. Polls `http://127.0.0.1:3100/login` until it returns 200.

## Fresh install on a new server

```bash
# prerequisites: Node >= 20.9, nginx, PostgreSQL, git, openssl (Ubuntu: apt install nginx postgresql git)
git clone https://github.com/Rhufuzz/3D-Neuro-Atlas.git /opt/cortex-aether
cd /opt/cortex-aether
PUBLIC_URL=https://YOUR_VPS_IP:8445 bash deploy/setup-env.sh   # DB role/database + .env with random secrets
bash deploy/deploy.sh
```

If you change the public URL/port, update `NEXTAUTH_URL` in `.env`, the `listen` port in the nginx site, and restart.
For a real domain, replace the self-signed cert with Let's Encrypt and set `NEXTAUTH_URL=https://your.domain`.

## Verification commands

```bash
systemctl is-active cortex-aether
curl -sk -o /dev/null -w '%{http_code}\n' https://127.0.0.1:8445/login        # expect 200
cd /opt/cortex-aether && NODE_TLS_REJECT_UNAUTHORIZED=0 AUTH_SMOKE_BASE=https://127.0.0.1:8445 node scripts/auth-smoke.mjs
# -> AUTH SMOKE: PASS (creates a throwaway smoke_<timestamp>@example.com user; delete it afterwards if you like)
```

## Verified status (2026-10-30)

First deployment completed: build OK (Next.js 16.4.1, Turbopack), `npm run typecheck` passes on the server,
`/login` returns 200 locally and from outside, unauthenticated `/atlas` redirects to `/login`, auth smoke test
PASS, and `/atlas`, `/modules`, `/modules/m1`, `/modules/m8`, `/literature`, `/study` all return 200 for a logged-in
user. The test accounts were deleted afterwards (the user table was empty at handoff). The other apps on the
server kept responding.

## Troubleshooting

- **502 from nginx** → the app is down: `journalctl -u cortex-aether -n 100`.
- **Login loops / `UntrustedHost`** → check `NEXTAUTH_URL` matches the URL in the browser (scheme, host, port) and `AUTH_TRUST_HOST=true`.
- **`@prisma/client did not initialize`** → run `npx prisma generate` in `/opt/cortex-aether`, rebuild, restart.
- **Build fails fetching Google Fonts** → the server needs outbound internet during `npm run build`.
- **Changed `.env`** → `systemctl restart cortex-aether` (and rebuild if a `NEXT_PUBLIC_*` value changed).
