#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
until nc -z postgres 5432; do
  echo "waiting db..."
  sleep 2
done

echo "⏳ Waiting for Redis..."
until nc -z redis 6379; do
  echo "waiting redis..."
  sleep 2
done

echo "✅ Services ready"

echo "⏳ Running Prisma migrations..."
npx prisma migrate deploy || exit 1

echo "🚀 Starting application..."
exec "$@"