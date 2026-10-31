#!/usr/bin/env bash
# Daily PostgreSQL backup for CORTEX-AETHER.
# Dumps cortex_aether database, compresses with gzip, retains last 14 daily dumps.
# Run via crontab: 0 3 * * * /opt/cortex-aether/scripts/backup.sh >> /var/log/cortex-backup.log 2>&1

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/cortex-aether}"
DB_NAME="${DB_NAME:-cortex_aether}"
DB_USER="${DB_USER:-cortex_aether}"
RETAIN_DAYS=14

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

TS=$(date -u +%Y%m%d_%H%M%SZ)
TARGET="$BACKUP_DIR/${DB_NAME}_${TS}.sql.gz"

# Dump using local peer auth via postgres system user
su - postgres -c "pg_dump -Fc $DB_NAME" | gzip > "$TARGET"
chmod 600 "$TARGET"

SIZE=$(du -h "$TARGET" | cut -f1)
echo "[$(date -u -Iseconds)] Backup OK: $TARGET ($SIZE)"

# Prune dumps older than retention window
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +"$RETAIN_DAYS" -delete
echo "[$(date -u -Iseconds)] Prune completed (kept last $RETAIN_DAYS days)"
