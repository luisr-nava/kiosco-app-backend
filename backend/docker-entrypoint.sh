#!/bin/sh
set -e

# Generate Prisma client (idempotente)
npx prisma generate

# Run database migrations before starting the app
npx prisma migrate deploy

exec "$@"
