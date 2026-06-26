#!/bin/sh
set -e

host="${DB_HOST:-postgres}"
port="${DB_PORT:-5432}"

echo "Esperando conexión con PostgreSQL ($host:$port)..."

until pg_isready -h "$host" -p "$port" -U "${DB_USER:-ecommerce}"; do
  echo "Esperando a que PostgreSQL ($host:$port) esté disponible..."
  sleep 2
done

echo "PostgreSQL está disponible. Iniciando el backend..."
exec "$@"
