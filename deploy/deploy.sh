#!/usr/bin/env bash
# Install / reinstall CORTEX-AETHER on an Ubuntu server with Node >= 20, nginx and PostgreSQL.
# Run as root from the repo root (expected location: /opt/cortex-aether):  bash deploy/deploy.sh
# Idempotent: safe to re-run. Requires .env (see deploy/setup-env.sh or .env.example).
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_USER="${APP_USER:-cortex}"
CERT_DIR=/etc/ssl/cortex-aether
cd "$APP_DIR"

[ "$APP_DIR" = "/opt/cortex-aether" ] || echo "deploy: WARNING app is in $APP_DIR; the systemd unit expects /opt/cortex-aether"
[ -f .env ] || { echo "deploy: .env missing - run deploy/setup-env.sh or copy .env.example"; exit 1; }

id "$APP_USER" >/dev/null 2>&1 || useradd --system --home-dir "$APP_DIR" --shell /usr/sbin/nologin "$APP_USER"

echo "deploy: installing dependencies"
npm install --no-audit --no-fund --legacy-peer-deps
echo "deploy: syncing database schema"
npx prisma db push --skip-generate
echo "deploy: building"
npm run build

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 600 .env

if [ ! -f "$CERT_DIR/cortex-aether.crt" ]; then
  echo "deploy: creating self-signed certificate"
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 -subj "/CN=cortex-aether" \
    -keyout "$CERT_DIR/cortex-aether.key" -out "$CERT_DIR/cortex-aether.crt" 2>/dev/null
  chmod 600 "$CERT_DIR/cortex-aether.key"
fi

install -m 644 deploy/cortex-aether.service /etc/systemd/system/cortex-aether.service
install -m 644 deploy/nginx-cortex-aether.conf /etc/nginx/sites-available/cortex-aether
ln -sf /etc/nginx/sites-available/cortex-aether /etc/nginx/sites-enabled/cortex-aether
if ! nginx -t; then
  rm -f /etc/nginx/sites-enabled/cortex-aether
  echo "deploy: nginx config invalid - cortex-aether site disabled, other sites untouched"
  exit 1
fi
systemctl reload nginx

systemctl daemon-reload
systemctl enable cortex-aether >/dev/null 2>&1
systemctl restart cortex-aether

for i in $(seq 1 30); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3100/login || true)"
  [ "$code" = "200" ] && { echo "deploy: OK - app answers on 127.0.0.1:3100 and https://<host>:8445"; exit 0; }
  sleep 2
done
echo "deploy: app did not answer in time - check: journalctl -u cortex-aether -n 100"
exit 1
