#!/usr/bin/env bash
# docker/scripts/backup.sh
# Nightly MongoDB dump — runs inside the backup container.
# Dumps are written to /backups (mounted from ./backups on the host).
# Dumps older than BACKUP_RETAIN_DAYS are pruned automatically.

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/${TIMESTAMP}"
MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_DB="${MONGO_DB:-coral}"
RETAIN_DAYS="${BACKUP_RETAIN_DAYS:-14}"

echo "[backup] Starting dump of ${MONGO_DB} at ${TIMESTAMP}"

mongodump \
  --host "${MONGO_HOST}" \
  --db   "${MONGO_DB}" \
  --out  "${BACKUP_DIR}" \
  --gzip

echo "[backup] Dump written to ${BACKUP_DIR}"

# Compress the whole dump directory into a single tarball
tar -czf "/backups/coral_${TIMESTAMP}.tar.gz" -C "${BACKUP_DIR}" .
rm -rf "${BACKUP_DIR}"

echo "[backup] Archive: /backups/coral_${TIMESTAMP}.tar.gz"

# Prune old backups
find /backups -maxdepth 1 -name "coral_*.tar.gz" -mtime "+${RETAIN_DAYS}" -delete
echo "[backup] Pruned backups older than ${RETAIN_DAYS} days"
