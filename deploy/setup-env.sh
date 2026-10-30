#!/usr/bin/env bash
# One-time: create the PostgreSQL role + database and write .env with freshly generated secrets.
# Run as root on the server from the repo root:  PUBLIC_URL=https://YOUR_VPS_IP:8445 bash deploy/setup-env.sh
# Secrets are generated on the server and never printed. An existing .env is left untouched.
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="${DB_NAME:-cortex_aether}"
DB_USER="${DB_USER:-cortex_aether}"
PUBLIC_URL="${PUBLIC_URL:?set PUBLIC_URL, e.g. https://YOUR_VPS_IP:8445}"
cd "$APP_DIR"

if [ -f .env ]; then
  echo "setup-env: .env already exists - leaving it untouched"
  exit 0
fi

DB_PASS="$(openssl rand -hex 24)"
AUTH_SECRET="$(openssl rand -base64 32)"

# Password is passed on stdin, not on the command line.
sudo -u postgres psql -v ON_ERROR_STOP=1 -q <<SQL
DO \$\$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    ALTER ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
  ELSE
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"
fi

umask 077
{
  echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}\""
  echo "AUTH_SECRET=\"${AUTH_SECRET}\""
  echo "NEXTAUTH_SECRET=\"${AUTH_SECRET}\""
  echo "NEXTAUTH_URL=\"${PUBLIC_URL}\""
  echo "AUTH_TRUST_HOST=true"
  echo "SEED_ADMIN_EMAIL="
  echo "SEED_ADMIN_PASSWORD="
} > .env
echo "setup-env: database '${DB_NAME}' ready and .env written (secrets not printed)"
