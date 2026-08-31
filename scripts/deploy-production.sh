#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${DEPLOY_PATH:-/www/wwwroot/advisor.rainerserver.net}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
BACKEND_PROCESS="${BACKEND_PROCESS:-advisor-backend}"
FRONTEND_PROCESS="${FRONTEND_PROCESS:-advisor-frontend}"

cd "$APP_DIR"

if [[ ! -d .git ]]; then
  echo "Deployment gagal: $APP_DIR bukan checkout Git."
  exit 1
fi

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Deployment dihentikan: terdapat perubahan file tracked di server."
  git status --short
  exit 1
fi

echo "Mengambil versi terbaru dari origin/$DEPLOY_BRANCH..."
git fetch --prune origin "$DEPLOY_BRANCH"
git switch "$DEPLOY_BRANCH"
git merge --ff-only "origin/$DEPLOY_BRANCH"

echo "Memasang dependency backend..."
(
  cd backend
  pnpm install --frozen-lockfile
  npm test
)

echo "Memasang dependency dan membangun frontend..."
(
  cd frontend
  npm ci
  npm run lint
  npm run build
)

echo "Menjalankan ulang service aplikasi..."
pm2 restart "$BACKEND_PROCESS"
pm2 restart "$FRONTEND_PROCESS"

echo "Memeriksa service lokal..."
curl --fail --silent --show-error --retry 10 --retry-delay 3 --retry-connrefused \
  http://127.0.0.1:4000/health > /dev/null
curl --fail --silent --show-error --retry 10 --retry-delay 3 --retry-connrefused \
  http://127.0.0.1:4001/ > /dev/null

echo "Deployment berhasil pada commit $(git rev-parse --short HEAD)."
