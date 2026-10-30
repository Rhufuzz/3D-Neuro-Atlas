#!/usr/bin/env bash
# Pull the latest code from GitHub and redeploy. Run as root from /opt/cortex-aether:
#   bash deploy/update.sh            (branch main)
#   BRANCH=my-branch bash deploy/update.sh
# If the folder was installed from a tarball (no .git yet) it is converted to a git checkout first.
# .env is git-ignored, so it is never overwritten.
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:-https://github.com/Rhufuzz/3D-Neuro-Atlas.git}"
cd "$APP_DIR"
GIT="git -c safe.directory=$APP_DIR"

if [ ! -d .git ]; then
  $GIT init -q
  $GIT remote add origin "$REPO_URL"
fi
$GIT fetch --depth=50 origin "$BRANCH"
$GIT reset --hard FETCH_HEAD
echo "update: now at $($GIT log -1 --oneline)"

exec bash deploy/deploy.sh
