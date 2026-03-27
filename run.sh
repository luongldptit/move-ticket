#!/bin/bash
set -e

echo "==> Pulling latest code..."
git pull
cd movie-ticket/
echo "==> Stopping containers..."
docker compose down

echo "==> Building and starting containers..."
docker compose up --build -d

echo "==> Done! Services running:"
docker compose ps
