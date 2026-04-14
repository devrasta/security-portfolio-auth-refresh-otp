#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Migrations done. Starting application..."
node dist/main.js &

echo "Starting Nginx..."
nginx -g 'daemon off;'
